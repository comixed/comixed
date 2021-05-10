/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import { LOAD_COMICS_URL } from '@app/library/library.constants';
import { LoadComicsRequest } from '@app/library/models/net/load-comics-request';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Loads a batch of comics.
   *
   * @param args.lastId the last id received
   */
  loadBatch(args: { lastId: number }): Observable<any> {
    this.logger.debug('Loading a batch of comics:', args);
    return this.http.post(interpolate(LOAD_COMICS_URL), {
      lastId: args.lastId
    } as LoadComicsRequest);
  }
}
