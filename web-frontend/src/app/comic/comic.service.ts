/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {Injectable, EventEmitter} from '@angular/core';

import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {User} from '../user.model';
import {ErrorsService} from '../errors.service';
import {Comic} from './comic.model';
import {Page} from './page.model';
import {PageType} from './page-type.model';
import {FileDetails} from './file-details.model';

@Injectable()
export class ComicService {
  private api_url = 'api';
  current_comic: Subject<Comic> = new BehaviorSubject<Comic>(new Comic());
  current_page: Subject<Page> = new BehaviorSubject<Page>(new Page());
  all_comics: Comic[] = [];
  all_comics_update: EventEmitter<Comic[]> = new EventEmitter();
  private last_comic_date: string;
  private fetching_comics = false;
  private user: User = new User();

  constructor(private http: HttpClient, private errorsService: ErrorsService) {
    this.monitorAuthentication();
    this.monitorComicList();
  }

  monitorAuthentication(): void {
    setInterval(() => {
      const headers = new HttpHeaders();
      this.http.get(`${this.api_url}/user`, {headers: headers}).subscribe(
        (user: User) => {
          this.user = user;
        },
        error => {
          console.log('ERROR: ' + error.message);
          this.user = new User();
        });
    }, 250);
  }

  monitorComicList(): void {
    setInterval(() => {
      if (!this.user.authenticated || this.fetching_comics) {
        return;
      } else {
        this.fetching_comics = true;
        let params = new HttpParams();
        if (this.last_comic_date) {
          params = new HttpParams().set('after', this.last_comic_date);
        }

        this.http.get(`${this.api_url}/comics`, {params: params, responseType: 'json'})
          .subscribe((comics: Comic[]) => {
            if (comics.length !== 0) {
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

  set_current_page(page: Page): void {
    this.current_page.next(page);
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

  get_page_types(): Observable<any> {
    return this.http.get(`/api/pages/types`);
  }

  set_page_type(page: Page, page_type: PageType): Observable<any> {
    const params = new HttpParams().set('type_id', `${page_type.id}`);
    return this.http.put(`/api/pages/${page.id}/type`, params);
  }

  get_display_name_for_page_type(page_type: PageType): string {
    switch (page_type.name) {
      case 'front-cover': return 'Front Cover';
      case 'inner-cover': return 'Inner Cover';
      case 'back-cover': return 'Back Cover';
      case 'roundup': return 'Roundup';
      case 'story': return 'Story';
      case 'advertisement': return 'Advertisement';
      case 'editorial': return 'Editorial';
      case 'letters': return 'Letters';
      case 'preview': return 'Preview';
      case 'other': return 'Other';
      case 'filtered': return 'Filtered';
      default: return 'Unknown (' + page_type + ')';
    }

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

  isAuthenticated(): boolean {
    return this.user.authenticated;
  }

  login(username: string, password: string, callback) {
    const headers = new HttpHeaders({authorization: 'Basic ' + btoa(username + ':' + password)});
    this.http.get(`${this.api_url}/user`, {headers: headers}).subscribe(
      (user: User) => {
        this.user = user;

        callback && callback();
      },
      error => {
        console.log('ERROR: ' + error.message);
        this.errorsService.fireErrorMessage('Login failure');
        this.user = new User();
      });
  }

  logout(): Observable<any> {
    return this.http.get(`${this.api_url}/logout`);
  }

  get_user(): User {
    return this.user;
  }

  getUsername(): string {
    return this.user.name;
  }

  get_user_preference(name: String): Observable<any> {
    return this.http.get(`${this.api_url}/user/property?name=${name}`);
  }

  change_username(username: string): Observable<any> {
    const params = new HttpParams().set('username', username);
    return this.http.post(`${this.api_url}/user/username`, params);
  }

  change_password(password: string): Observable<any> {
    const params = new HttpParams().set('password', password);
    return this.http.post(`${this.api_url}/user/password`, params);
  }

  set_user_preference(name: string, value: string): void {
    const params = new HttpParams().set('name', name).set('value', value);
    this.http.post(`${this.api_url}/user/property`, params).subscribe(
      (response: Response) => {
        console.log('Preference saved: ' + name + '=' + value);
      },
      (error: Error) => {
        console.log('ERROR:', error.message);
        this.errorsService.fireErrorMessage('Failed to set user preference: ' + name + '=' + value);
      }
    );
  }
}
