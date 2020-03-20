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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CREATE_READING_LIST_URL,
  GET_READING_LIST_URL,
  GET_READING_LISTS_URL,
  SAVE_READING_LIST_URL
} from 'app/app.constants';
import { interpolate } from 'app/app.functions';
import { SaveReadingListRequest } from 'app/library/models/net/save-reading-list-request';
import { ReadingList } from 'app/library/models/reading-list/reading-list';
import { LoggerService } from '@angular-ru/logger';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReadingListService {
  constructor(private http: HttpClient, private logger: LoggerService) {}

  get_all(): Observable<any> {
    this.logger.debug('getting all reading lists');
    return this.http.get(interpolate(GET_READING_LISTS_URL));
  }

  get_reading_list(id: number): Observable<any> {
    this.logger.debug(`getting reading list: id=${id}`);
    return this.http.get(interpolate(GET_READING_LIST_URL, { id: id }));
  }

  save_reading_list(reading_list: ReadingList): Observable<any> {
    const entries = (reading_list.entries || []).map(entry => entry.comic.id);
    const encoded: SaveReadingListRequest = {
      name: reading_list.name,
      entries: entries,
      summary: reading_list.summary
    };
    if (reading_list.id) {
      this.logger.debug(`saving reading list: ${reading_list}`);
      return this.http.put(
        interpolate(SAVE_READING_LIST_URL, { id: reading_list.id }),
        encoded
      );
    } else {
      this.logger.debug(`creating reading list: ${reading_list}`);
      const params = new HttpParams()
        .set('name', reading_list.name)
        .set('summary', reading_list.summary)
        .set('entries', entries.toString());
      return this.http.post(interpolate(CREATE_READING_LIST_URL), params);
    }
  }
}
