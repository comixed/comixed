import {Injectable, EventEmitter, Output} from '@angular/core';

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
  private api_url = 'http://localhost:7171';
  current_comic: Subject<Comic> = new BehaviorSubject<Comic>(new Comic());
  all_comics: Comic[];
  all_comics_update: EventEmitter<Comic[]> = new EventEmitter();

  constructor(private http: Http) {
    this.http.get(`${this.api_url}/comics`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
      .subscribe(
      (comics: Comic[]) => {
        this.all_comics = comics;
        this.all_comics_update.emit(this.all_comics);
      });
  }

  setCurrentComic(comic: Comic): void {
    this.current_comic.next(comic);
  }

  removeComic(comic_id: number) {
    this.all_comics = this.all_comics.filter((comic: Comic) => {return comic.id != comic_id});
    this.all_comics_update.emit(this.all_comics);
  }

  getComic(id: number): Observable<Comic> {
    return this.http.get(`${this.api_url}/comics/${id}`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getComicSummary(id: number): Observable<Comic> {
    return this.http.get(`${this.api_url}/comics/${id}/summary`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getComicCount(): Observable<number> {
    return this.http.get(`${this.api_url}/comics/count`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getDuplicatePageCount(): Observable<number> {
    return this.http.get(`${this.api_url}/pages/duplicates/count`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getDuplicatePages(): Observable<Page[]> {
    return this.http.get(`${this.api_url}/pages/duplicates`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getFilesUnder(directory: string): Observable<FileDetails[]> {
    return this.http.get(`${this.api_url}/files/contents?directory=${directory}`)
      .map((res: Response) => <FileDetails[]>res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  deleteComic(comic: Comic): Observable<boolean> {
    return this.http.delete(`${this.api_url}/comics/${comic.id}`)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  importFiles(filenames: string[]): Observable<Response> {
    return this.http.post(`${this.api_url}/files/import`, filenames);
  }

  getImageUrl(comicId: number, index: number): string {
    return `${this.api_url}/comics/${comicId}/pages/${index}/content`;
  }

  getMissingImageUrl(): string {
    return '/assets/img/missing.png';
  }

  getImageUrlForId(pageId: number): string {
    return `${this.api_url}/pages/${pageId}/content`;
  }

  getComicDownloadLink(comicId: number): string {
    return `${this.api_url}/comics/${comicId}/download`;
  }
}
