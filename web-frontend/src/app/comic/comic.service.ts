import {Injectable} from '@angular/core';

import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {Comic} from './comic.model';
import {Page} from './page.model';
import {FileDetails} from './file-details.model';

@Injectable()
export class ComicService {
  private apiUrl = 'http://localhost:7171';
  current_comic: Subject<Comic> = new BehaviorSubject<Comic>(new Comic());

  constructor(private http: Http) {}

  setCurrentComic(comic: Comic): void {
    this.current_comic.next(comic);
  }

  findAll(): Observable<Comic[]> {
    return this.http.get(`${this.apiUrl}/comics`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getComic(id: number): Observable<Comic> {
    return this.http.get(`${this.apiUrl}/comics/${id}`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getComicSummary(id: number): Observable<Comic> {
    return this.http.get(`${this.apiUrl}/comics/${id}/summary`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getComicCount(): Observable<number> {
    return this.http.get(`${this.apiUrl}/comics/count`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getDuplicatePageCount(): Observable<number> {
    return this.http.get(`${this.apiUrl}/pages/duplicates/count`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getDuplicatePages(): Observable<Page[]> {
    return this.http.get(`${this.apiUrl}/pages/duplicates`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getFilesUnder(directory: string): Observable<FileDetails[]> {
    return this.http.get(`${this.apiUrl}/files/contents?directory=${directory}`)
      .map((res: Response) => <FileDetails[]>res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  deleteComic(comic: Comic): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/comics/${comic.id}`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  importFiles(filenames: string[]): Observable<Response> {
    return this.http.post(`${this.apiUrl}/files/import`, filenames);
  }

  getImageUrl(comicId: number, index: number): string {
    return `${this.apiUrl}/comics/${comicId}/pages/${index}/content`;
  }

  getMissingImageUrl(): string {
    return '/assets/img/missing.png';
  }

  getImageUrlForId(pageId: number): string {
    return `${this.apiUrl}/pages/${pageId}/content`;
  }

  getComicDownloadLink(comicId: number): string {
    return `${this.apiUrl}/comics/${comicId}/download`;
  }
}
