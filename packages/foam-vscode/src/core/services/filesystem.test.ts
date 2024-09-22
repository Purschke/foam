import { TEST_DATA_DIR } from '../../test/test-utils';
import path from 'path';
import { FileSystem } from './filesystem'
import { URI } from '../model/uri';

test('filesystem', async () => {
    expect.assertions(2);

    var fs = new FileSystem(path.dirname(filename));
    await fs.write(URI.parse(filename), content)
    .then(() => fs.list())
    .then(files => expect(files).toContainEqual(URI.parse(path.basename(filename))))
    .then(() => fs.read(URI.parse(filename)))
    .then(data => expect(data).toBe(content))
    .catch(error => console.log(error))
});

const filename = path.join(TEST_DATA_DIR.path, 'Test.md');
const content = 'HELLO SCHOBI';