import {Injectable} from '@angular/core';

import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';

import {Comic} from './comic.model';
import {FileDetails} from './fileDetails';

@Injectable()
export class ComicService {

  private apiUrl = 'http://localhost:7171';

  constructor(private http: Http) {}

  findAll(): Observable<Comic[]> {
    return this.http.get(`${this.apiUrl}/comics`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getComicCount(): Observable<number> {
    return this.http.get(`${this.apiUrl}/comics/count`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getFilesUnder(directory: string): Observable<FileDetails[]> {
    return this.http.get(`${this.apiUrl}/files/contents?directory=${directory}`)
      .map((res: Response) => <FileDetails[]>res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  importFiles(filenames: string[]): Observable<Response> {
    const formData: FormData = new FormData();
    for (let index = 0; index < filenames.length; index++) {
      formData.append('filenames', filenames[index]);
    }
    return this.http.post(this.apiUrl + '/files/import', formData);
  }

  getImageUrl(comicId: number, index: number): string {
    return `${this.apiUrl}/comics/${comicId}/pages/${index}/content`;
  }
}
