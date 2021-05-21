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
import {
  LOAD_COMIC_URL,
  SET_READ_STATE_URL
} from '@app/library/library.constants';
import { Comic } from '@app/comic-book/models/comic';
import { SetComicReadRequest } from '@app/library/models/net/set-comic-read-request';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Loads a single comic.
   * @param args.id the comic id
   */
  loadComic(args: { id: number }): Observable<any> {
    this.logger.debug('Service: load a comic:', args);
    return this.http.get(interpolate(LOAD_COMIC_URL, { id: args.id }));
  }

  /**
   * Sets the read state for a set of comics.
   * @param args.comics the comics to be updated
   * @param args.read the read state
   */
  setRead(args: { comics: Comic[]; read: boolean }): Observable<any> {
    this.logger.debug('Service: setting comic read state:', args);
    return this.http.post(interpolate(SET_READ_STATE_URL), {
      ids: args.comics.map(comic => comic.id),
      read: args.read
    } as SetComicReadRequest);
  }
}
