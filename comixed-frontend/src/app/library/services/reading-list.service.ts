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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interpolate } from 'app/app.functions';
import { SaveReadingListRequest } from 'app/library/models/net/save-reading-list-request';
import { LoggerService } from '@angular-ru/logger';
import { Observable } from 'rxjs';
import {
  CREATE_READING_LIST_URL,
  UPDATE_READING_LIST_URL
} from 'app/library/library.constants';

@Injectable({
  providedIn: 'root'
})
export class ReadingListService {
  constructor(private http: HttpClient, private logger: LoggerService) {}

  save(id: number, name: string, summary: string): Observable<any> {
    const encoded: SaveReadingListRequest = {
      name: name,
      summary: summary
    };
    if (!!id) {
      this.logger.debug(
        `http [PUT]: saving reading list: id=${id} name=${name}`
      );
      return this.http.put(
        interpolate(UPDATE_READING_LIST_URL, { id: id }),
        encoded
      );
    } else {
      this.logger.debug(`http [POST]: creating reading list: name=${name}`);
      return this.http.post(interpolate(CREATE_READING_LIST_URL), encoded);
    }
  }
}
