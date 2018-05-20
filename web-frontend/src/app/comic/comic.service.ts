import {Injectable, EventEmitter} from '@angular/core';

import {HttpClient, HttpParams} from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {ErrorsService} from '../errors.service';
import {Comic} from './comic.model';
import {Page} from './page.model';
import {FileDetails} from './file-details.model';

@Injectable()
export class ComicService {
  private api_url = 'http://localhost:7171';
  current_comic: Subject<Comic> = new BehaviorSubject<Comic>(new Comic());
  all_comics: Comic[] = [];
  all_comics_update: EventEmitter<Comic[]> = new EventEmitter();
  private last_comic_date: string;
  private fetching_comics: boolean = false;

  constructor(private http: HttpClient, private errorsService: ErrorsService) {
    setInterval(() => {
      if (this.fetching_comics) {
        return;
      } else {
        this.fetching_comics = true;
        let params = new HttpParams();
        if (this.last_comic_date) {
          console.log('Using after date:', this.last_comic_date);
          params = new HttpParams().set('after', this.last_comic_date);
          console.log('params:', params.toString());
        }

        this.http.get(`${this.api_url}/comics`, {params: params, responseType: 'json'})
          .subscribe((comics: Comic[]) => {
            if (comics.length !== 0) {
              console.log('Retrieved ' + comics.length + ' new comics');
              this.all_comics = this.all_comics.concat(comics);
              this.all_comics.forEach((comic: Comic) => {
                if (this.last_comic_date == null || comic.added_date > this.last_comic_date) {
                  this.last_comic_date = comic.added_date;
                }
              });
              this.all_comics_update.emit(this.all_comics);
            }
            this.fetching_comics = false;
          },
          error => {
            this.errorsService.fireErrorMessage('Failed to get the list of comics...');
            console.log('ERROR:', error.message);
            this.fetching_comics = false;
          });
      }
    }, 500);
  }

  setCurrentComic(comic: Comic): void {
    this.current_comic.next(comic);
  }

  removeComic(comic_id: number) {
    this.all_comics = this.all_comics.filter((comic: Comic) => comic.id !== comic_id);
    this.all_comics_update.emit(this.all_comics);
  }

  getComic(id: number): Observable<any> {
    return this.http.get(`${this.api_url}/comics/${id}`);
  }

  getComicSummary(id: number): Observable<any> {
    return this.http.get(`${this.api_url}/comics/${id}/summary`);
  }

  getComicCount(): Observable<any> {
    return this.http.get(`${this.api_url}/comics/count`);
  }

  getDuplicatePageCount(): Observable<any> {
    return this.http.get(`${this.api_url}/pages/duplicates/count`);
  }

  getDuplicatePages(): Observable<any> {
    return this.http.get(`${this.api_url}/pages/duplicates`);
  }

  markPageAsDeleted(page: Page): Observable<any> {
    return this.http.delete(`${this.api_url}/pages/${page.id}`);
  }

  markPageAsUndeleted(page: Page): Observable<any> {
    return this.http.post(`${this.api_url}/pages/${page.id}/undelete`, {});
  }

  getFilesUnder(directory: string): Observable<any> {
    return this.http.get(`${this.api_url}/files/contents?directory=${directory}`);
  }

  deleteComic(comic: Comic): Observable<any> {
    return this.http.delete(`${this.api_url}/comics/${comic.id}`);
  }

  importFiles(filenames: string[]): Observable<any> {
    return this.http.post(`${this.api_url}/files/import`, filenames);
  }

  getPendingImports(): Observable<any> {
    return this.http.get(`${this.api_url}/files/import/status`);
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
