import { URI } from '../model/uri';
import { IDataStore } from './datastore'
import fs, { writeFile } from 'fs'

export class FileSystem implements IDataStore {
  root: string;

  constructor(root: string) {
    this.root = root;
  }

  //TODO: why list dont use parameter as root?
  async list(): Promise<URI[]> {
    var files = new Array<URI>();
    await fs.readdir(this.root, (err, data) => {
      if(!err){
        data.forEach(file => {
          files.push(URI.parse(file));
        });
      }
    });

    return files;
  }

  async read (uri: URI): Promise<string | null> {
    var content : string = "";
    await fs.readFile(this.root, { encoding: 'utf8' }, (err, data) => {
      if(!err){
        content = data;
      }
    });
    
    return content;
  }

  async write(uri: URI, content: string) {
    await fs.writeFile(uri.path, content, () => {

    });
  }

}
