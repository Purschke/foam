import {
  createTestNote,
  createTestTrainNote,
  createTestWorkspace,
} from '../../test/test-utils';
import { TrainNoteService } from './train-noteService';
import { URI } from './uri';

describe('Synced trie', () => {
  it('Added', () => {
    const ws = createTestWorkspace();
    ws.set(createTestTrainNote({ uri: '/page-a.md' }));

    const ts = TrainNoteService.fromWorkspace(ws);

    ws.set(createTestTrainNote({ uri: '/page-c.md' }));
    ws.set(createTestNote({ uri: '/page-b.md' }));

    expect(
      ts
        .list()
        .map(n => n.uri.path)
        .sort()
    ).toEqual(['/page-a.md', '/page-c.md']);
  });

  it('Updated', () => {
    const ws = createTestWorkspace();
    ws.set(createTestTrainNote({ uri: '/page-a.md', title: 'foo' }));

    const ts = TrainNoteService.fromWorkspace(ws);

    ws.set(createTestTrainNote({ uri: '/page-c.md', title: 'bar' }));
    ws.set(createTestNote({ uri: '/page-b.md', title: 'Fred' }));

    ws.set(createTestTrainNote({ uri: '/page-c.md', title: 'Mani' }));

    expect(
      ts
        .list()
        .map(n => ({ path: n.uri.path, title: n.title }))
        .sort((a, b) => a.path.localeCompare(b.path))
    ).toEqual([
      { path: '/page-a.md', title: 'foo' },
      { path: '/page-c.md', title: 'Mani' },
    ]);
  });

  it('Deleted', () => {
    const ws = createTestWorkspace();
    ws.set(createTestTrainNote({ uri: '/page-a.md' }));

    const ts = TrainNoteService.fromWorkspace(ws);

    ws.set(createTestTrainNote({ uri: '/page-c.md' }));
    ws.set(createTestNote({ uri: '/page-b.md' }));
    ws.delete(URI.parse('/page-a.md'));

    expect(
      ts
        .list()
        .map(n => n.uri.path)
        .sort()
    ).toEqual(['/page-c.md']);
  });
});
