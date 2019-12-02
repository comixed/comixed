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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { interpolate } from 'app/app.functions';
import {
  DELETE_MULTIPLE_COMICS_URL,
  GET_COMICS_URL,
  GET_UPDATES_URL,
  START_RESCAN_URL
} from 'app/app.constants';
import { GetLibraryUpdatesRequest } from 'app/library/models/net/get-library-updates-request';
import { GetComicsRequest } from 'app/library/models/net/get-comics-request';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  constructor(private http: HttpClient) {}

  getComics(
    page: number,
    count: number,
    sortField: string,
    ascending: boolean
  ): Observable<any> {
    return this.http.post(interpolate(GET_COMICS_URL), {
      page: page,
      count: count,
      sortField: sortField,
      ascending: ascending
    } as GetComicsRequest);
  }

  getUpdatesSince(
    timestamp: number,
    timeout: number,
    maximumRecords: number,
    lastProcessingCount: number,
    lastRescanCount: number
  ): Observable<any> {
    return this.http.post(
      interpolate(GET_UPDATES_URL, { timestamp: timestamp }),
      {
        timeout: timeout,
        maximumResults: maximumRecords,
        lastProcessingCount: lastProcessingCount,
        lastRescanCount: lastRescanCount
      } as GetLibraryUpdatesRequest
    );
  }

  startRescan(): Observable<any> {
    return this.http.post(interpolate(START_RESCAN_URL), { start: true });
  }

  deleteMultipleComics(ids: number[]): Observable<any> {
    const params = new HttpParams().set('comic_ids', ids.toString());
    return this.http.post(interpolate(DELETE_MULTIPLE_COMICS_URL), params);
  }
}
