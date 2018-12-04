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

import { Injectable, EventEmitter } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service';
import { AlertService } from './alert.service';
import { Comic } from '../models/comics/comic';
import { Page } from '../models/comics/page';
import { PageType } from '../models/comics/page-type';
import { ComicFile } from '../models/import/comic-file';

@Injectable()
export class ComicService {
  private api_url = '/api';

  constructor(
    private http: HttpClient,
    private alert_service: AlertService,
    private user_service: UserService,
  ) { }

  fetch_remote_library_state(latest_comic_update: string): Observable<any> {
    return this.http.get(`${this.api_url}/comics/since/${latest_comic_update}?timeout=60000`);
  }

  delete_comic(comic: Comic): Observable<any> {
    return this.http.delete(`${this.api_url}/comics/${comic.id}`);
  }

  load_comic_from_remote(id: number): Observable<any> {
    return this.http.get(`${this.api_url}/comics/${id}`);
  }

  get_comic_summary(id: number): Observable<any> {
    return this.http.get(`${this.api_url}/comics/${id}/summary`);
  }

  get_page_types(): Observable<any> {
    return this.http.get(`/api/pages/types`);
  }

  set_page_type(page: Page, page_type_id: number): Observable<any> {
    const params = new HttpParams().set('type_id', `${page_type_id}`);
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

  get_duplicate_pages(): Observable<any> {
    return this.http.get(`${this.api_url}/pages/duplicates`);
  }

  mark_page_as_deleted(page: Page): Observable<any> {
    return this.http.delete(`${this.api_url}/pages/${page.id}`);
  }

  mark_page_as_undeleted(page: Page): Observable<any> {
    return this.http.post(`${this.api_url}/pages/${page.id}/undelete`, {});
  }

  delete_all_pages_for_hash(hash: string): Observable<any> {
    return this.http.delete(`${this.api_url}/pages/hash/${hash}`);
  }

  undelete_all_pages_for_hash(hash: string): Observable<any> {
    return this.http.put(`${this.api_url}/pages/hash/${hash}`, {});
  }

  get_files_under_directory(directory: string): Observable<any> {
    return this.http.get(`${this.api_url}/files/contents?directory=${encodeURI(directory)}`);
  }

  set_block_page(page_hash: string, blocked: boolean): Observable<any> {
    if (blocked) {
      return this.block_page(page_hash);
    } else {
      return this.unblock_page(page_hash);
    }
  }

  block_page(page_hash: string): Observable<any> {
    const params = new HttpParams().set('hash', page_hash);
    return this.http.post(`${this.api_url}/pages/blocked`, params);
  }

  unblock_page(page_hash: string): Observable<any> {
    return this.http.delete(`${this.api_url}/pages/blocked/${page_hash}`);
  }

  import_files_into_library(filenames: string[], delete_blocked_pages: boolean): Observable<any> {
    filenames.forEach((filename, index, source) => source[index] = encodeURIComponent(filename));
    const params = new HttpParams().set('filenames', filenames.toString()).set('delete_blocked_pages', delete_blocked_pages.toString());
    return this.http.post(`${this.api_url}/files/import`, params);
  }

  get_number_of_pending_imports(): Observable<any> {
    return this.http.get(`${this.api_url}/files/import/status`);
  }

  get_url_for_page_by_comic_index(comicId: number, index: number): string {
    return `${this.api_url}/comics/${comicId}/pages/${index}/content`;
  }

  get_cover_url_for_comic(comic: Comic): string {
    return `${this.api_url}/comics/${comic.id}/pages/0/content`;
  }

  get_label_for_comic(comic: Comic): string {
    return `${comic.series || 'Unknown'} v${comic.volume || 'Unknown'} #${comic.issue_number || '??'}`;
  }

  get_url_for_missing_page(): string {
    return '/assets/img/missing.png';
  }

  get_url_for_page_by_id(pageId: number): string {
    if (pageId === null || pageId === undefined) {
      return '';
    }
    return `${this.api_url}/pages/${pageId}/content`;
  }

  get_cover_url_for_file(filename: string): string {
    return `${this.api_url}/files/import/cover?filename=` + encodeURIComponent(filename);
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

  fetch_candidates_for(api_key: string,
    series_name: string, volume: string, issue_number: string,
    skip_cache: boolean): Observable<any> {
    const params = new HttpParams()
      .set('api_key', api_key)
      .set('series_name', series_name)
      .set('volume', volume)
      .set('issue_number', issue_number)
      .set('skip_cache', `${skip_cache}`);

    return this.http.post(`${this.api_url}/scraper/query/volumes`, params);
  }

  scrape_comic_details_for(api_key: string, volume: number, issue_number: string): Observable<any> {
    const params = new HttpParams()
      .set('api_key', api_key)
      .set('volume', `${volume}`)
      .set('issue_number', issue_number);

    return this.http.post(`${this.api_url}/scraper/query/issue`, params);
  }

  scrape_and_save_comic_details(api_key: string, comic_id: number, issue_id: number): Observable<any> {
    const params = new HttpParams()
      .set('api_key', api_key)
      .set('comic_id', `${comic_id}`)
      .set('issue_id', `${issue_id}`);

    return this.http.post(`${this.api_url}/scraper/save`, params);
  }

  save_changes_to_comic(comic: Comic, series: string, volume: string, issue_number: string): Observable<any> {
    const params = new HttpParams()
      .set('series', series)
      .set('volume', volume)
      .set('issue_number', issue_number);
    return this.http.put(`${this.api_url}/comics/${comic.id}`, params)
      .finally(() => {
        comic.series = series;
        comic.volume = volume;
        comic.issue_number = issue_number;
      });
  }
}
