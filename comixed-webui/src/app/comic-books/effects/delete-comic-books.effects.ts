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
import {
  deleteComicBooksFailure,
  deleteComicBooksSuccess,
  deleteSelectedComicBooks,
  deleteSingleComicBook,
  undeleteSelectedComicBooks,
  undeleteSingleComicBook
} from '../actions/delete-comic-books.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookService } from '@app/comic-books/services/comic-book.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class DeleteComicBooksEffects {
  deleteSingleComicBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteSingleComicBook),
      tap(action =>
        this.logger.trace('Effect: delete a single comic book:', action)
      ),
      switchMap(action =>
        this.comicService
          .deleteSingleComicBook({
            comicBookId: action.comicBookId
          })
          .pipe(
            tap(response => this.logger.trace('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-book.mark-as-deleted.effect-success',
                  { deleted: true }
                )
              )
            ),
            map(() => deleteComicBooksSuccess()),
            catchError(error => this.doServiceFailure(error, true))
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteComicBooksFailure());
      })
    );
  });

  undeleteSingleComicBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(undeleteSingleComicBook),
      tap(action =>
        this.logger.trace('Effect: undelete a single comic book:', action)
      ),
      switchMap(action =>
        this.comicService
          .undeleteSingleComicBook({ comicBookId: action.comicBookId })
          .pipe(
            tap(response => this.logger.trace('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-book.mark-as-deleted.effect-success',
                  { deleted: false }
                )
              )
            ),
            map(() => deleteComicBooksSuccess()),
            catchError(error => this.doServiceFailure(error, false))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  deleteSelectedComicBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteSelectedComicBooks),
      tap(action =>
        this.logger.trace('Effect: deleting selected comic books:', action)
      ),
      switchMap(action =>
        this.comicService.deleteSelectedComicBooks().pipe(
          tap(response => this.logger.trace('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic-book.mark-as-deleted.effect-success',
                { deleted: true }
              )
            )
          ),
          map(() => deleteComicBooksSuccess()),
          catchError(error => this.doServiceFailure(error, true))
        )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  undeleteSelectedComicBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(undeleteSelectedComicBooks),
      tap(action =>
        this.logger.trace('Effect: undeleted selected comic books:', action)
      ),
      switchMap(action =>
        this.comicService.undeleteSelectedComicBooks().pipe(
          tap(response => this.logger.trace('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic-book.mark-as-deleted.effect-success',
                { deleted: false }
              )
            )
          ),
          map(() => deleteComicBooksSuccess()),
          catchError(error => this.doServiceFailure(error, false))
        )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicService: ComicBookService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  private doServiceFailure(error: any, deleted: boolean) {
    this.logger.error('Service failure:', error);
    this.alertService.error(
      this.translateService.instant(
        'comic-book.mark-as-deleted.effect-failure',
        { deleted }
      )
    );
    return of(deleteComicBooksFailure());
  }

  private doGeneralFailure(error: any) {
    this.logger.error('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(deleteComicBooksFailure());
  }
}
