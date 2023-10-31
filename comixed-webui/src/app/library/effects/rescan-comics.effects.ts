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
  rescanComicBooksFailure,
  rescanComicBooksSuccess,
  rescanSelectedComicBooks,
  rescanSingleComicBook
} from '../actions/rescan-comics.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryService } from '@app/library/services/library.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class RescanComicsEffects {
  rescanSingleComicBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(rescanSingleComicBook),
      tap(action => this.logger.trace('Rescan a single comic book:', action)),
      switchMap(action =>
        this.libraryService
          .rescanSingleComicBook({ comicBookId: action.comicBookId })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'library.rescan-comics.effect-success'
                )
              )
            ),
            map(() => rescanComicBooksSuccess()),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  rescanSelectedComicBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(rescanSelectedComicBooks),
      tap(action => this.logger.trace('Rescan selected comic books:', action)),
      switchMap(action =>
        this.libraryService.rescanSelectedComicBooks().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'library.rescan-comics.effect-success'
              )
            )
          ),
          map(() => rescanComicBooksSuccess()),
          catchError(error => this.doServiceFailure(error))
        )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private libraryService: LibraryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  private doServiceFailure(error: any) {
    this.logger.error('Service failure:', error);
    this.alertService.error(
      this.translateService.instant('library.rescan-comics.effect-failure')
    );
    return of(rescanComicBooksFailure());
  }

  private doGeneralFailure(error: any) {
    this.logger.error('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(rescanComicBooksFailure());
  }
}
