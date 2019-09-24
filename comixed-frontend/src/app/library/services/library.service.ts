/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { interpolate } from 'app/app.functions';
import {
  CLEAR_METADATA_URL,
  DELETE_MULTIPLE_COMICS_URL,
  GET_FORMATS_URL,
  GET_SCAN_TYPES_URL,
  GET_UPDATES_URL,
  SET_BLOCKED_PAGE_HASH_URL,
  START_RESCAN_URL,
  UPDATE_COMIC_URL
} from 'app/app.constants';
import { Comic } from 'app/comics/models/comic';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  constructor(private http: HttpClient) {}

  get_scan_types(): Observable<any> {
    return this.http.get(interpolate(GET_SCAN_TYPES_URL));
  }

  get_formats(): Observable<any> {
    return this.http.get(interpolate(GET_FORMATS_URL));
  }

  get_updates(
    latest_update_date: number,
    timeout: number,
    maximum: number
  ): Observable<any> {
    return this.http.get(
      interpolate(GET_UPDATES_URL, {
        later_than: latest_update_date,
        timeout: timeout,
        maximum: maximum
      })
    );
  }

  start_rescan(): Observable<any> {
    return this.http.post(interpolate(START_RESCAN_URL), { start: true });
  }

  update_comic(comic: Comic): Observable<any> {
    return this.http.put(
      interpolate(UPDATE_COMIC_URL, { id: comic.id }),
      comic
    );
  }

  clear_metadata(comic: Comic): Observable<any> {
    return this.http.delete(interpolate(CLEAR_METADATA_URL, { id: comic.id }));
  }

  set_block_page_hash(hash: string, block: boolean): Observable<any> {
    const url = interpolate(SET_BLOCKED_PAGE_HASH_URL, { hash: hash });

    if (block) {
      return this.http.post(url, { blocked: true });
    } else {
      return this.http.delete(url);
    }
  }

  delete_multiple_comics(ids: number[]): Observable<any> {
    const params = new HttpParams().set('comic_ids', ids.toString());
    return this.http.post(interpolate(DELETE_MULTIPLE_COMICS_URL), params);
  }
}
