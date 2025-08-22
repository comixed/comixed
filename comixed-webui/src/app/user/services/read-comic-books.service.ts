/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import {
  SET_COMIC_BOOK_READ_STATE_URL,
  SET_SELECTED_COMIC_BOOKS_READ_STATE_URL
} from '@app/user/user.constants';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReadComicBooksService {
  logger = inject(LoggerService);
  http = inject(HttpClient);

  setSingleReadState(args: {
    comicBookId: number;
    read: boolean;
  }): Observable<any> {
    if (args.read) {
      this.logger.debug('Service: marking comic book as read:', args);
      return this.http.put(
        interpolate(SET_COMIC_BOOK_READ_STATE_URL, {
          comicBookId: args.comicBookId
        }),
        {}
      );
    } else {
      this.logger.debug('Service: markin comic book as unread:', args);
      return this.http.delete(
        interpolate(SET_COMIC_BOOK_READ_STATE_URL, {
          comicBookId: args.comicBookId
        })
      );
    }
  }

  setSelectedReadState(args: { read: boolean }): Observable<any> {
    if (args.read) {
      this.logger.debug('Service: marking selected comic books as read:', args);
      return this.http.put(
        interpolate(SET_SELECTED_COMIC_BOOKS_READ_STATE_URL),
        {}
      );
    } else {
      this.logger.debug(
        'Service: marking selected comic books as unread:',
        args
      );
      return this.http.delete(
        interpolate(SET_SELECTED_COMIC_BOOKS_READ_STATE_URL)
      );
    }
  }
}
