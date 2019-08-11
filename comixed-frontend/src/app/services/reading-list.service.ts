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
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  CREATE_READING_LIST_URL,
  GET_READING_LISTS_URL,
  UPDATE_READING_LIST_URL
} from 'app/services/url.constants';
import { ReadingList } from 'app/models/reading-list';
import { ReadingListEntry } from 'app/models/reading-list-entry';
import { interpolate } from 'app/app.functions';

@Injectable({
  providedIn: 'root'
})
export class ReadingListService {
  constructor(private http: HttpClient) {}

  save_reading_list(reading_list: ReadingList): Observable<any> {
    const entries = [];
    reading_list.entries.forEach((entry: ReadingListEntry) =>
      entries.push(entry.comic.id)
    );
    const params = new HttpParams()
      .set('name', reading_list.name)
      .set('summary', reading_list.summary)
      .set('entries', `${entries}`);

    if (reading_list.id) {
      return this.http.put(
        interpolate(UPDATE_READING_LIST_URL, { id: reading_list.id }),
        params
      );
    } else {
      return this.http.post(CREATE_READING_LIST_URL, params);
    }
  }

  get_reading_lists() {
    return this.http.get(GET_READING_LISTS_URL);
  }
}
