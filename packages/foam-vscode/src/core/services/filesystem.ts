import { URI } from '../model/uri';
import { IDataStore } from './datastore'
import fs from 'fs';

export class FileSystem implements IDataStore {
  root: string;

  constructor(root: string) {
    this.root = root;
  }

  //TODO: why list dont use parameter as root?
  list(): Promise<URI[]> {
    let files: URI[] = [];
    
    return new Promise((resolve, reject) => {
      fs.readdir(this.root, (err, data) => {
        if(!err){
          data.forEach(file => {
            files.push(URI.parse(file));
          });
        } else{
          reject(err);
        }

        resolve(files);
      });
    });
}

  read (uri: URI): Promise<string | null> {
    return new Promise ((resolve, reject) => {
      fs.readFile(uri.path, { encoding: 'utf8' }, (err, data) => {
        if(!err){
          resolve(data);
        }
        reject(err);
      });
    });
  }

  async write(uri: URI, content: string) {
    await fs.writeFile(uri.path, content, (err) => {

    });
  }

}
