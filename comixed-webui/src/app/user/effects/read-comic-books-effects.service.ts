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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  markSelectedComicBooksRead,
  markSelectedComicBooksReadFailed,
  markSelectedComicBooksReadSuccess,
  markSingleComicBookRead
} from '@app/user/actions/read-comic-books.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ReadComicBooksService } from '@app/user/services/read-comic-books.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ReadComicBooksEffects {
  setSingleComicBookReadState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(markSingleComicBookRead),
      tap(action =>
        this.logger.debug(
          'Effect: updating single comic book read status:',
          action
        )
      ),
      switchMap(action =>
        this.readComicBooksService
          .setSingleReadState({
            comicBookId: action.comicBookId,
            read: action.read
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'single-comic-book-read-state.effect-success',
                  { status: action.read }
                )
              )
            ),
            map(() => markSelectedComicBooksReadSuccess()),
            catchError(error =>
              this.doServiceFailure(
                error,
                action.read,
                'single-comic-book-read-state.effect-failure'
              )
            )
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  setSelectedComicBooksReadState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(markSelectedComicBooksRead),
      tap(action =>
        this.logger.debug('Effect: updating comic read status:', action)
      ),
      switchMap(action =>
        this.readComicBooksService
          .setSelectedReadState({ read: action.read })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'selected-comic-books-read-state.effect-success',
                  { status: action.read }
                )
              )
            ),
            map(() => markSelectedComicBooksReadSuccess()),
            catchError(error =>
              this.doServiceFailure(
                error,
                action.read,
                'selected-comic-books-read-state.effect-failure'
              )
            )
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private readComicBooksService: ReadComicBooksService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  private doServiceFailure(error: any, read: boolean, errorMessage: string) {
    this.logger.error('Service failure:', error);
    this.alertService.error(
      this.translateService.instant(errorMessage, { status: read })
    );
    return of(markSelectedComicBooksReadFailed());
  }

  private doGeneralFailure(error: any) {
    this.logger.error('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(markSelectedComicBooksReadFailed());
  }
}
