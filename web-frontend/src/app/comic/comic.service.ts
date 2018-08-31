/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import {UserService} from '../user.service';
import {AlertService} from '../alert.service';
import {Comic} from './comic.model';
import {Page} from './page.model';
import {PageType} from './page-type.model';
import {FileDetails} from './file-details.model';

@Injectable()
export class ComicService {
  private api_url = '/api';
  current_comic: Subject<Comic> = new BehaviorSubject<Comic>(new Comic());
  current_page: Subject<Page> = new BehaviorSubject<Page>(new Page());
  all_comics: Comic[];
  all_comics_update: EventEmitter<Comic[]> = new EventEmitter();
  comic_count: Subject<number> = new BehaviorSubject<number>(0);
  private last_comic_date: string;
  private fetching_comics = false;

  constructor(
    private http: HttpClient,
    private alert_service: AlertService,
    private user_service: UserService,
  ) {
    this.monitor_remote_comic_list();
    this.all_comics = [];
    this.last_comic_date = '0';
  }

  monitor_remote_comic_list(): void {
    const that = this;
    setInterval(() => {
      if (!this.user_service.is_authenticated() || this.fetching_comics) {
        return;
      } else {
        that.fetching_comics = true;
        that.http.get(`${that.api_url}/comics/since/${that.last_comic_date}`)
          .subscribe((comics: Comic[]) => {
            if ((comics || []).length > 0) {
              that.all_comics = that.all_comics.concat(comics);
              that.comic_count.next(that.all_comics.length);
              that.all_comics.forEach((comic: Comic) => {
                if (parseInt(comic.added_date, 10) > parseInt(that.last_comic_date, 10)) {
                  that.last_comic_date = comic.added_date;
                }
              });
              that.all_comics_update.emit(that.all_comics);
            }
            that.fetching_comics = false;
          },
          error => {
            that.alert_service.show_error_message('Failed to get the list of comics...', error);
            that.fetching_comics = false;
          });
      }
    }, 500);
  }

  reload_comics(): void {
    this.all_comics = [];
  }

  set_current_comic(comic: Comic): void {
    this.current_comic.next(comic);
  }

  set_current_page(page: Page): void {
    this.current_page.next(page);
  }

  remove_comic_from_local(comic_id: number) {
    this.all_comics = this.all_comics.filter((comic: Comic) => comic.id !== comic_id);
    this.all_comics_update.emit(this.all_comics);
  }

  load_comic_from_remote(id: number): Observable<any> {
    return this.http.get(`${this.api_url}/comics/${id}`);
  }

  get_comic_summary(id: number): Observable<any> {
    return this.http.get(`${this.api_url}/comics/${id}/summary`);
  }

  get_library_comic_count(): Observable<any> {
    return this.comic_count.asObservable();
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

  get_duplicate_page_count(): Observable<any> {
    return this.http.get(`${this.api_url}/pages/duplicates/count`);
  }

  get_duplicate_page_hashes(): Observable<any> {
    return this.http.get(`${this.api_url}/pages/duplicates/hashes`);
  }

  get_pages_for_hash(page_hash: string): Observable<any> {
    return this.http.get(`${this.api_url}/pages/hashes/${page_hash}`);
  }

  mark_page_as_deleted(page: Page): Observable<any> {
    return this.http.delete(`${this.api_url}/pages/${page.id}`);
  }

  mark_page_as_undeleted(page: Page): Observable<any> {
    return this.http.post(`${this.api_url}/pages/${page.id}/undelete`, {});
  }

  get_files_under_directory(directory: string): Observable<any> {
    return this.http.get(`${this.api_url}/files/contents?directory=${encodeURI(directory)}`);
  }

  block_page(page_hash: string): Observable<any> {
    const params = new HttpParams().set('hash', page_hash);
    return this.http.post(`${this.api_url}/pages/blocked`, params);
  }

  unblock_page(page_hash: string): Observable<any> {
    return this.http.delete(`${this.api_url}/pages/blocked/${page_hash}`);
  }

  remove_comic_from_library(comic: Comic): Observable<any> {
    return this.http.delete(`${this.api_url}/comics/${comic.id}`);
  }

  import_files_into_library(filenames: string[], delete_blocked_pages: boolean): Observable<any> {
    filenames.forEach((filename, index, source) => source[index] = this.encode_filename(filename));
    const params = new HttpParams().set('filenames', filenames.toString()).set('delete_blocked_pages', delete_blocked_pages.toString());
    return this.http.post(`${this.api_url}/files/import`, params);
  }

  encode_filename(filename: string): string {
    return filename.replace(/,/g, '%2C').replace(/#/g, '%23').replace(/&/g, '%26');
  }

  get_number_of_pending_imports(): Observable<any> {
    return this.http.get(`${this.api_url}/files/import/status`);
  }

  get_url_for_page_by_comic_index(comicId: number, index: number): string {
    return `${this.api_url}/comics/${comicId}/pages/${index}/content`;
  }

  get_url_for_page_by_hash(hash: string): string {
    return `${this.api_url}/pages/hashes/${hash}/content`;
  }

  get_url_for_missing_page(): string {
    return '/assets/img/missing.png';
  }

  get_url_for_page_by_id(pageId: number): string {
    return `${this.api_url}/pages/${pageId}/content`;
  }

  get_cover_url_for_file(filename: string): string {
    // not fond of this, but encodeURI was NOT doing it for me...
    const encoded_filename = this.encode_filename(filename);
    return `${this.api_url}/files/import/cover?filename=` + encoded_filename;
  }

  get_issue_label_text_for_comic(comic: Comic): string {
    return `${comic.series || 'Unknown Series'} #${comic.issue_number || '??'} (v.${comic.volume || '????'})`;
  }

  get_issue_content_label_for_comic(comic: Comic): string {
    return `${comic.title || '[no title defined]'}`;
  }

  get_download_link_for_comic(comicId: number): string {
    return `${this.api_url}/comics/${comicId}/download`;
  }

  fetch_candidates_for(api_key: string, series_name: string): Observable<any> {
    const params = new HttpParams().set('api_key', api_key).set('series_name', series_name);

    return this.http.post(`${this.api_url}/scraper/query`, params);
  }
}
