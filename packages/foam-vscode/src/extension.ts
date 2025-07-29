/*global markdownit:readonly*/

import { workspace, ExtensionContext, window, commands } from 'vscode';
import { MarkdownResourceProvider } from './core/services/markdown-provider';
import { bootstrap } from './core/model/foam';
import { Logger } from './core/utils/log';
import { features } from './features';
import { VsCodeOutputLogger, exposeLogger } from './services/logging';
import {
  getAttachmentsExtensions,
  getIgnoredFilesSetting,
  getNotesExtensions,
} from './settings';
import { AttachmentResourceProvider } from './core/services/attachment-provider';
import { VsCodeWatcher } from './services/watcher';
import VsCodeBasedParserCache from './services/cache';
import { createMatcherAndDataStore } from './services/editor';
import {
  aliasesPlugin,
  CachedParser,
  definitionsPlugin,
  FoamParser,
  propertiesPlugin,
  sectionsPlugin,
  tagsPlugin,
  titlePlugin,
  wikilinkPlugin,
} from './core/services/markdown-parser';
import { Resource } from './core/model/note';
import { URI } from './core/model/uri';
import { FrontmatterMarkdownDirector } from './core/services/markdown-director';

export async function activate(context: ExtensionContext) {
  const logger = new VsCodeOutputLogger();
  Logger.setDefaultLogger(logger);
  exposeLogger(context, logger);

  try {
    Logger.info('Starting Foam');

    if (workspace.workspaceFolders === undefined) {
      Logger.info('No workspace open. Foam will not start');
      return;
    }

    // Prepare Foam
    const excludes = getIgnoredFilesSetting().map(g => g.toString());
    const { matcher, dataStore, excludePatterns } =
      await createMatcherAndDataStore(excludes);

    Logger.info('Loading from directories:');
    for (const folder of workspace.workspaceFolders) {
      Logger.info('- ' + folder.uri.fsPath);
      Logger.info('  Include: **/*');
      Logger.info('  Exclude: ' + excludePatterns.get(folder.name).join(','));
    }

    const watcher = new VsCodeWatcher(
      workspace.createFileSystemWatcher('**/*')
    );

    const resourceCache = new VsCodeBasedParserCache<Resource>(context);
    const parser = new FrontmatterMarkdownDirector({
      note: ResourceParser(resourceCache),
    });

    const { notesExtensions, defaultExtension } = getNotesExtensions();

    const markdownProvider = new MarkdownResourceProvider(
      dataStore,
      parser,
      notesExtensions
    );

    const attachmentExtConfig = getAttachmentsExtensions();
    const attachmentProvider = new AttachmentResourceProvider(
      attachmentExtConfig
    );

    const foamPromise = bootstrap(
      matcher,
      watcher,
      dataStore,
      parser,
      [markdownProvider, attachmentProvider],
      defaultExtension
    );

    // Load the features
    const featuresPromises = features.map(feature =>
      feature(context, foamPromise)
    );

    const foam = await foamPromise;
    Logger.info(`Loaded ${foam.workspace.list().length} resources`);

    context.subscriptions.push(
      foam,
      watcher,
      markdownProvider,
      attachmentProvider,
      commands.registerCommand('foam-vscode.clear-cache', () =>
        resourceCache.clear()
      ),
      workspace.onDidChangeConfiguration(e => {
        if (
          [
            'foam.files.ignore',
            'foam.files.attachmentExtensions',
            'foam.files.noteExtensions',
            'foam.files.defaultNoteExtension',
          ].some(setting => e.affectsConfiguration(setting))
        ) {
          window.showInformationMessage(
            'Foam: Reload the window to use the updated settings'
          );
        }
      })
    );

    const feats = (await Promise.all(featuresPromises)).filter(r => r != null);

    return {
      extendMarkdownIt: (md: markdownit) => {
        return feats.reduce((acc: markdownit, r: any) => {
          return r.extendMarkdownIt ? r.extendMarkdownIt(acc) : acc;
        }, md);
      },
      foam,
    };
  } catch (e) {
    Logger.error('An error occurred while bootstrapping Foam', e);
    window.showErrorMessage(
      `An error occurred while bootstrapping Foam. ${e.stack}`
    );
  }
}

function ResourceParser(parserCache: VsCodeBasedParserCache<Resource>) {
  const factory = (uri: URI): Resource => {
    return {
      uri: uri,
      type: 'note',
      properties: {},
      title: '',
      definitions: [],
      sections: null,
      tags: null,
      aliases: [],
      links: [],
    };
  };

  const resourceParser = new FoamParser<Resource>(
    factory,
    titlePlugin,
    wikilinkPlugin,
    definitionsPlugin,
    tagsPlugin,
    aliasesPlugin,
    sectionsPlugin,
    propertiesPlugin
  );

  return new CachedParser(parserCache, resourceParser);
}
