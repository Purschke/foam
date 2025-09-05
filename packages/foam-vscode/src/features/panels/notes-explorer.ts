import * as vscode from 'vscode';
import { Foam } from '../../core/model/foam';
import { FoamWorkspace } from '../../core/model/workspace';
import {
  ResourceRangeTreeItem,
  ResourceTreeItem,
  TrainTreeItem,
  createBacklinkItemsForResource as createBacklinkTreeItemsForResource,
  expandAll,
} from './utils/tree-view-utils';
import { Resource } from '../../core/model/note';
import { FoamGraph } from '../../core/model/graph';
import { ContextMemento } from '../../utils/vsc-utils';
import {
  FolderTreeItem,
  FolderTreeProvider,
} from './utils/folder-tree-provider';
import { TrainNote } from '../../core/model/train-note';

export default async function activate(
  context: vscode.ExtensionContext,
  foamPromise: Promise<Foam>
) {
  const foam = await foamPromise;
  const provider = new NotesProvider(
    foam.workspace,
    foam.graph,
    context.globalState
  );
  provider.refresh();
  const treeView = vscode.window.createTreeView<NotesTreeItems>(
    'foam-vscode.notes-explorer',
    {
      treeDataProvider: provider,
      showCollapseAll: true,
      canSelectMany: true,
    }
  );
  const revealTextEditorItem = async () => {
    const target = vscode.window.activeTextEditor?.document.uri;
    if (treeView.visible) {
      if (target) {
        const item = await findTreeItemByUri(provider, target);
        // Check if the item is already selected.
        // This check is needed because always calling reveal() will
        // cause the tree view to take the focus from the item when
        // browsing the notes explorer
        if (
          item &&
          !treeView.selection.find(
            i => i.resourceUri?.path === item.resourceUri.path
          )
        ) {
          treeView.reveal(item);
        }
      }
    }
  };

  context.subscriptions.push(
    treeView,
    provider,
    foam.graph.onDidUpdate(() => {
      provider.refresh();
    }),
    vscode.commands.registerCommand(
      `foam-vscode.views.notes-explorer.expand-all`,
      (...args) =>
        expandAll(treeView, provider, node => node.contextValue === 'folder')
    ),
    vscode.window.onDidChangeActiveTextEditor(revealTextEditorItem),
    treeView.onDidChangeVisibility(revealTextEditorItem)
  );
}

export function findTreeItemByUri<I, T>(
  provider: FolderTreeProvider<I, T>,
  target: vscode.Uri
) {
  const path = vscode.workspace.asRelativePath(
    target,
    vscode.workspace.workspaceFolders.length > 1
  );
  return provider.findTreeItemByPath(path.split('/'));
}

export type NotesTreeItems =
  | ResourceTreeItem
  | TrainTreeItem
  | FolderTreeItem<Resource>
  | ResourceRangeTreeItem;

export class NotesProvider extends FolderTreeProvider<
  NotesTreeItems,
  Resource
> {
  public show: ContextMemento<'all' | 'notes-only'>;

  constructor(
    private workspace: FoamWorkspace,
    private graph: FoamGraph,
    private state: vscode.Memento
  ) {
    super();
    this.show = new ContextMemento<'all' | 'notes-only'>(
      this.state,
      `foam-vscode.views.notes-explorer.show`,
      'all'
    );

    this.disposables.push(
      vscode.commands.registerCommand(
        `foam-vscode.views.notes-explorer.show:all`,
        () => {
          this.show.update('all');
          this.refresh();
        }
      ),
      vscode.commands.registerCommand(
        `foam-vscode.views.notes-explorer.show:notes`,
        () => {
          this.show.update('notes-only');
          this.refresh();
        }
      )
    );
  }

  getValues() {
    return this.workspace
      .list()
      .concat(this.workspace.trainNoteWorkspace.list());
  }

  getFilterFn() {
    return this.show.get() === 'notes-only'
      ? res => res.type !== 'image' && res.type !== 'attachment'
      : () => true;
  }

  valueToPath(value: Resource) {
    const path = vscode.workspace.asRelativePath(
      value.uri.path,
      vscode.workspace.workspaceFolders.length > 1
    );
    const parts = path.split('/');
    return parts;
  }

  createValueTreeItem(
    value: Resource | TrainNote,
    parent: FolderTreeItem<Resource>
  ): NotesTreeItems {
    const description =
      value.uri.getName().toLowerCase() === value.title.toLowerCase()
        ? undefined
        : value.uri.getBasename();

    const getChildren = async () => {
      const backlinks = await createBacklinkTreeItemsForResource(
        this.workspace,
        this.graph,
        value.uri
      );
      backlinks.forEach(b => {
        b.description = b.label;
        b.label = b.resource.title;
      });
      return backlinks;
    };

    return new TreeFactory().make(
      value,
      this.workspace,
      description,
      getChildren,
      {
        parent: parent,
        collapsibleState:
          this.graph.getBacklinks(value.uri).length > 0
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None,
      }
    );
  }
}

class TreeFactory {
  make(
    value: Resource | TrainNote,
    workspace: FoamWorkspace,
    description: string,
    getChildren: () => Promise<vscode.TreeItem[]>,
    options: {
      collapsibleState?: vscode.TreeItemCollapsibleState;
      parent?: FolderTreeItem<Resource>;
    }
  ) {
    const builder =
      value instanceof TrainNote
        ? new TrainTreeBuilder(value, workspace)
        : new ResourceTreeBuilder(value, workspace);

    return builder
      .setDescription(description)
      .setChildrenGetter(getChildren)
      .setOptions(options.parent, options.collapsibleState)
      .build();
  }
}

abstract class TreeBuilder<Tvalue, TtreeItem> {
  protected value: Tvalue;
  protected workspace: FoamWorkspace;
  protected description: string;
  protected getChildren: () => Promise<vscode.TreeItem[]>;
  protected options: {
    collapsibleState?: vscode.TreeItemCollapsibleState;
    parent?: vscode.TreeItem;
  };

  constructor(value: Tvalue, workspace: FoamWorkspace) {
    this.value = value;
    this.workspace = workspace;
  }

  setOptions(
    parent: FolderTreeItem<Resource>,
    state: vscode.TreeItemCollapsibleState
  ) {
    this.options = {
      collapsibleState: state,
      parent: parent,
    };
    return this;
  }

  setDescription(description?: string) {
    this.description = description;
    return this;
  }

  setChildrenGetter(getChildren: () => Promise<vscode.TreeItem[]>) {
    this.getChildren = getChildren;
    return this;
  }

  setWorkspace(ws: FoamWorkspace) {
    this.workspace = ws;
    return this;
  }

  abstract build(): TtreeItem;
}

class ResourceTreeBuilder extends TreeBuilder<Resource, ResourceTreeItem> {
  constructor(resource: Resource, workspace: FoamWorkspace) {
    super(resource, workspace);
  }

  build(): ResourceTreeItem {
    const item = new ResourceTreeItem(this.value, this.workspace, this.options);
    item.id = this.value.uri.toString();
    item.getChildren = async () => this.getChildren();
    item.description = this.description;
    return item;
  }
}

class TrainTreeBuilder extends TreeBuilder<TrainNote, TrainTreeItem> {
  override build(): TrainTreeItem {
    const item = new TrainTreeItem(this.value, this.workspace, this.options);
    item.id = this.value.uri.toString();
    item.getChildren = async () => this.getChildren();
    item.description = this.description;
    return item;
  }
}
