/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  CLEAR_COMIC_BOOK_SELECTIONS_URL,
  UPDATE_COMIC_BOOK_SELECTIONS_URL
} from '@app/library/library.constants';
import { interpolate } from '@app/core';
import { SelectComicBooksRequest } from '@app/library/models/net/select-comic-books-request';

@Injectable({
  providedIn: 'root'
})
export class LibrarySelectionsService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  updateComicBookSelections(args: {
    ids: number[];
    adding: boolean;
  }): Observable<any> {
    this.logger.trace('Updating comic book selections:', args);
    return this.http.post(interpolate(UPDATE_COMIC_BOOK_SELECTIONS_URL), {
      ids: args.ids,
      adding: args.adding
    } as SelectComicBooksRequest);
  }

  clearSelections(): Observable<any> {
    this.logger.trace('Clearing comic book selections');
    return this.http.delete(interpolate(CLEAR_COMIC_BOOK_SELECTIONS_URL));
  }
}
