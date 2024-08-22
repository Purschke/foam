import { TEST_DATA_DIR } from '../../test/test-utils';
import path from 'path';
import { FileSystem } from './filesystem'


describe('filesystem', () => {
  it('list files', () => {
    var fs = new FileSystem(TEST_DATA_DIR.path);
    var files = fs.list();
    expect(files).toContain(filename);
  });
});

const filename = path.join(TEST_DATA_DIR.path, 'Test.md');