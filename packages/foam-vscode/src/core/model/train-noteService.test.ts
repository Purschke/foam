import {
  createTestNote,
  createTestTrainNote,
  createTestWorkspace,
} from '../../test/test-utils';
import { TrainNoteService } from './train-noteService';

describe('Synced trie', () => {
  it('Added', () => {
    const ws = createTestWorkspace();
    ws.set(createTestTrainNote({ uri: '/page-a.md' }));
    ws.set(createTestTrainNote({ uri: '/page-c.md' }));

    const ts = TrainNoteService.fromWorkspace(ws);

    ws.set(createTestNote({ uri: '/page-b.md' }));

    expect(
      ts
        .list()
        .map(n => n.uri.path)
        .sort()
    ).toEqual(['/page-a.md', '/page-c.md']);
  });
});
