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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { finalize } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserService } from './user.service';
import { Comic, ComicFormat, ScanType } from 'app/library';
import {
  GET_COMIC_METADATA_URL,
  GET_SCRAPING_CANDIDATES_URL,
  RESCAN_COMIC_FILES_URL
} from 'app/services/url.constants';
import { Page } from 'app/comics';

export const COMIC_SERVICE_API_URL = '/api';

@Injectable()
export class ComicService {
  constructor(private http: HttpClient) {}

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

  download_backup(): Observable<any> {
    return this.http.get(`${COMIC_SERVICE_API_URL}/admin/data/export`);
  }
}
