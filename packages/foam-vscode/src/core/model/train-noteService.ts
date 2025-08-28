import TrieMap from 'mnemonist/trie-map';
import { IDisposable } from '../common/lifecycle';
import { Resource } from './note';
import { TrainNote, TrainNoteStepper } from './train-note';
import { FoamWorkspace, TrieIdentifier } from './workspace';
import { TrainNoteWriter } from '../services/Writer/train-note-writer';
import { FrontmatterWriter } from '../../services/frontmatter-writer';
import { WriteObserver } from '../utils/observer';

export class TrainNoteService implements IDisposable {
  private constructor() {}

  private _trainnotes: TrieMap<string, TrainNote> = new TrieMap();
  private disposables: IDisposable[] = [];

  private set(id: string, resource: Resource) {
    const isTrainNote = this.IsTrainNote(resource);
    if (!isTrainNote.result) return;

    this.validateTrainNote(isTrainNote.value);
    this._trainnotes.set(id, isTrainNote.value);
  }

  private delete(id: string, resource: Resource) {
    const isTrainNote = this.IsTrainNote(resource);
    if (!isTrainNote.result) return;

    this._trainnotes.delete(id);
  }

  public list(): TrainNote[] {
    return Array.from(this._trainnotes.values());
  }

  private IsTrainNote(resource: Resource): {
    result: boolean;
    value: TrainNote;
  } {
    if (resource instanceof TrainNote) {
      return { result: true, value: resource as TrainNote };
    }

    return { result: false, value: null };
  }

  private validateTrainNote(trainnote: TrainNote) {
    if (trainnote.currentPhase === undefined) {
      const stepper = new TrainNoteStepper(
        new WriteObserver(new FrontmatterWriter())
      );
      stepper.setPhase(trainnote, trainnote.phases.First());
    }
  }

  dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }

  public static fromWorkspace(workspace: FoamWorkspace): TrainNoteService {
    const service = new TrainNoteService();
    workspace
      .list()
      .forEach(res =>
        service.set(new TrieIdentifier(service._trainnotes).get(res.uri), res)
      );

    service.disposables.push(
      workspace.onDidAdd(e => service.set(e.id, e.resource)),
      workspace.onDidUpdate(e => service.set(e.id, e.new)),
      workspace.onDidDelete(e => service.delete(e.id, e.resource))
    );

    return service;
  }
}
