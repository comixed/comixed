/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookService } from '@app/comic-books/services/comic-book.service';
import {
  oldComicBooksReceived,
  oldLoadComicBooks,
  oldLoadComicBooksFailed
} from '@app/comic-books/actions/comic-book-list.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { OldLoadComicsResponse } from '@app/comic-books/models/net/old-load-comics-response';
import { of } from 'rxjs';
import { ComicDetailListService } from '@app/comic-books/services/comic-detail-list.service';

@Injectable()
export class ComicBookListEffects {
  loadBatch$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(oldLoadComicBooks),
      tap(action => this.logger.debug('Effect: load comic batch:', action)),
      switchMap(action =>
        this.comicService
          .loadBatch({ maxRecords: action.maxRecords, lastId: action.lastId })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: OldLoadComicsResponse) =>
              oldComicBooksReceived({
                comicBooks: response.comicBooks,
                lastId: response.lastId,
                lastPayload: response.lastPayload
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              return of(oldLoadComicBooksFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        return of(oldLoadComicBooksFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicService: ComicBookService,
    private comicListService: ComicDetailListService
  ) {
    // done to ensure the service was injected
    this.logger.assert(this.comicListService);
  }
}
