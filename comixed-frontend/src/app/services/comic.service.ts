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

import { finalize } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service';
import { Comic } from 'app/models/comics/comic';
import { Page } from 'app/models/comics/page';
import { ScanType } from 'app/models/comics/scan-type';
import { ComicFormat } from 'app/models/comics/comic-format';
import {
  GET_COMIC_METADATA_URL,
  GET_SCRAPING_CANDIDATES_URL,
  RESCAN_COMIC_FILES_URL
} from 'app/services/url.constants';

export const COMIC_SERVICE_API_URL = '/api';

@Injectable()
export class ComicService {
  constructor(private http: HttpClient, private user_service: UserService) {}

  delete_multiple_comics(comics: Array<Comic>): Observable<any> {
    const ids = [];
    comics.forEach((comic: Comic) => ids.push(comic.id));
    const params = new HttpParams().set('comic_ids', ids.toString());
    return this.http.post(
      `${COMIC_SERVICE_API_URL}/comics/multiple/delete`,
      params
    );
  }

  fetch_scan_types(): Observable<any> {
    return this.http.get(`${COMIC_SERVICE_API_URL}/comics/scan_types`);
  }

  set_scan_type(comic: Comic, scan_type: ScanType): Observable<any> {
    const params = new HttpParams().set('scan_type_id', `${scan_type.id}`);

    return this.http.put(
      `${COMIC_SERVICE_API_URL}/comics/${comic.id}/scan_type`,
      params
    );
  }

  fetch_formats(): Observable<any> {
    return this.http.get(`${COMIC_SERVICE_API_URL}/comics/formats`);
  }

  set_format(comic: Comic, format: ComicFormat): Observable<any> {
    const params = new HttpParams().set('format_id', `${format.id}`);

    return this.http.put(
      `${COMIC_SERVICE_API_URL}/comics/${comic.id}/format`,
      params
    );
  }

  set_sort_name(comic: Comic, sort_name: string): Observable<any> {
    const params = new HttpParams().set('sort_name', sort_name);

    return this.http.put(
      `${COMIC_SERVICE_API_URL}/comics/${comic.id}/sort_name`,
      params
    );
  }

  fetch_remote_library_state(
    latest_comic_update: string,
    timeout: number
  ): Observable<any> {
    return this.http.get(
      `${COMIC_SERVICE_API_URL}/comics/since/${latest_comic_update}?timeout=${timeout}`
    );
  }

  delete_comic(comic: Comic): Observable<any> {
    return this.http.delete(`${COMIC_SERVICE_API_URL}/comics/${comic.id}`);
  }

  get_comic_summary(id: number): Observable<any> {
    return this.http.get(`${COMIC_SERVICE_API_URL}/comics/${id}/summary`);
  }

  get_page_types(): Observable<any> {
    return this.http.get(`/api/pages/types`);
  }

  set_page_type(page: Page, page_type_id: number): Observable<any> {
    const params = new HttpParams().set('type_id', `${page_type_id}`);
    return this.http.put(`/api/pages/${page.id}/type`, params);
  }

  get_duplicate_pages(): Observable<any> {
    return this.http.get(`${COMIC_SERVICE_API_URL}/pages/duplicates`);
  }

  mark_page_as_deleted(page: Page): Observable<any> {
    return this.http.delete(`${COMIC_SERVICE_API_URL}/pages/${page.id}`);
  }

  mark_page_as_undeleted(page: Page): Observable<any> {
    return this.http.post(
      `${COMIC_SERVICE_API_URL}/pages/${page.id}/undelete`,
      {}
    );
  }

  delete_all_pages_for_hash(hash: string): Observable<any> {
    return this.http.delete(`${COMIC_SERVICE_API_URL}/pages/hash/${hash}`);
  }

  undelete_all_pages_for_hash(hash: string): Observable<any> {
    return this.http.put(`${COMIC_SERVICE_API_URL}/pages/hash/${hash}`, {});
  }

  get_files_under_directory(directory: string): Observable<any> {
    return this.http.get(
      `${COMIC_SERVICE_API_URL}/files/contents?directory=${encodeURI(
        directory
      )}`
    );
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
    return this.http.post(`${COMIC_SERVICE_API_URL}/pages/blocked`, params);
  }

  unblock_page(page_hash: string): Observable<any> {
    return this.http.delete(
      `${COMIC_SERVICE_API_URL}/pages/blocked/${page_hash}`
    );
  }

  import_files_into_library(
    filenames: string[],
    delete_blocked_pages: boolean,
    ignore_metadata: boolean
  ): Observable<any> {
    filenames.forEach(
      (filename, index, source) =>
        (source[index] = encodeURIComponent(filename))
    );
    const params = new HttpParams()
      .set('filenames', filenames.toString())
      .set('delete_blocked_pages', delete_blocked_pages.toString())
      .set('ignore_metadata', ignore_metadata.toString());
    return this.http.post(`${COMIC_SERVICE_API_URL}/files/import`, params);
  }

  rescan_files(): Observable<any> {
    const params = new HttpParams();

    return this.http.post(RESCAN_COMIC_FILES_URL, params);
  }

  fetch_candidates_for(
    api_key: string,
    series_name: string,
    volume: string,
    issue_number: string,
    skip_cache: boolean
  ): Observable<any> {
    const params = new HttpParams()
      .set('api_key', api_key)
      .set('series_name', series_name)
      .set('volume', volume)
      .set('issue_number', issue_number)
      .set('skip_cache', `${skip_cache}`);

    return this.http.post(GET_SCRAPING_CANDIDATES_URL, params);
  }

  scrape_comic_details_for(
    api_key: string,
    volume: string,
    issue_number: string,
    skip_cache: boolean
  ): Observable<any> {
    const params = new HttpParams()
      .set('api_key', api_key)
      .set('volume', volume)
      .set('issue_number', issue_number)
      .set('skip_cache', `${skip_cache}`);

    return this.http.post(GET_COMIC_METADATA_URL, params);
  }

  scrape_and_save_comic_details(
    api_key: string,
    comic_id: number,
    issue_id: number,
    skip_cache: boolean
  ): Observable<any> {
    const params = new HttpParams()
      .set('api_key', api_key)
      .set('comic_id', `${comic_id}`)
      .set('issue_id', `${issue_id}`)
      .set('skip_cache', `${skip_cache}`);

    return this.http.post(`${COMIC_SERVICE_API_URL}/scraper/save`, params);
  }

  save_changes_to_comic(
    comic: Comic,
    series: string,
    volume: string,
    issue_number: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('series', series)
      .set('volume', volume)
      .set('issue_number', issue_number);
    return this.http
      .put(`${COMIC_SERVICE_API_URL}/comics/${comic.id}`, params)
      .pipe(
        finalize(() => {
          comic.series = series;
          comic.volume = volume;
          comic.issue_number = issue_number;
        })
      );
  }

  clear_metadata(comic: Comic): Observable<any> {
    return this.http.delete(
      `${COMIC_SERVICE_API_URL}/comics/${comic.id}/metadata`
    );
  }

  download_backup(): Observable<any> {
    return this.http.get(`${COMIC_SERVICE_API_URL}/admin/data/export`);
  }
}
