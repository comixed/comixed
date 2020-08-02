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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interpolate } from 'app/app.functions';
import { Comic, Page } from 'app/comics';
import {
  CLEAR_METADATA_URL,
  DELETE_COMIC_URL,
  GET_COMIC_URL,
  GET_FORMATS_URL,
  GET_PAGE_TYPES_URL,
  GET_SCAN_TYPES_URL,
  MARK_COMIC_AS_READ_URL,
  MARK_COMIC_AS_UNREAD_URL,
  MARK_PAGE_DELETED_URL,
  RESTORE_COMIC_URL,
  SAVE_COMIC_URL,
  UNMARK_PAGE_DELETED_URL
} from 'app/comics/comics.constants';
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';

@Injectable({
  providedIn: 'root'
})
export class ComicService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  getScanTypes(): Observable<any> {
    return this.http.get(interpolate(GET_SCAN_TYPES_URL));
  }

  getFormats(): Observable<any> {
    return this.http.get(interpolate(GET_FORMATS_URL));
  }

  getPageTypes(): Observable<any> {
    return this.http.get(interpolate(GET_PAGE_TYPES_URL));
  }

  getIssue(id: number): Observable<any> {
    return this.http.get(interpolate(GET_COMIC_URL, { id: id }));
  }

  saveComic(comic: Comic): Observable<any> {
    return this.http.put(interpolate(SAVE_COMIC_URL, { id: comic.id }), comic);
  }

  clearMetadata(comic: Comic): Observable<any> {
    return this.http.delete(interpolate(CLEAR_METADATA_URL, { id: comic.id }));
  }

  deleteComic(comic: Comic): Observable<any> {
    return this.http.delete(interpolate(DELETE_COMIC_URL, { id: comic.id }));
  }

  restoreComic(comic: Comic): Observable<any> {
    return this.http.put(interpolate(RESTORE_COMIC_URL, { id: comic.id }), {});
  }

  markAsRead(comic: Comic, mark: boolean): Observable<any> {
    if (mark) {
      this.logger.debug('http [PUT]: Marking comic as read');
      return this.http.put(
        interpolate(MARK_COMIC_AS_READ_URL, { id: comic.id }),
        {}
      );
    } else {
      this.logger.debug('http [DELETE]: Unmarking comic as read');
      return this.http.delete(
        interpolate(MARK_COMIC_AS_UNREAD_URL, { id: comic.id })
      );
    }
  }

  deletePage(page: Page, mark: boolean): Observable<any> {
    if (mark) {
      this.logger.debug('http [DELETE]: Marking page as deleted');
      return this.http.delete(
        interpolate(MARK_PAGE_DELETED_URL, {
          id: page.id
        })
      );
    } else {
      this.logger.debug('http [POST]: Unmarking page as deleted');
      return this.http.post(
        interpolate(UNMARK_PAGE_DELETED_URL, {
          id: page.id
        }),
        {}
      );
    }
  }
}
