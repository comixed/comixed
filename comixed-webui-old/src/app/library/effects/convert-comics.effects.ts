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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  convertComicsFailure,
  convertComicsSuccess,
  convertSelectedComics,
  convertSingleComic
} from '../actions/convert-comic-books.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryService } from '@app/library/services/library.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class ConvertComicsEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  libraryService = inject(LibraryService);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);

  convertSingleComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(convertSingleComic),
      tap(action =>
        this.logger.trace('Converting a single comic book:', action)
      ),
      switchMap(action =>
        this.libraryService
          .convertSingleComic({
            id: action.id,
            archiveType: action.archiveType
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'library.convert-single-comic-book.effect-success',
                  {
                    archiveType: action.archiveType
                  }
                )
              )
            ),
            map(() => convertComicsSuccess()),
            catchError(error =>
              this.doServiceFailure(
                error,
                'library.convert-single-comic-book.effect-failure'
              )
            )
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });
  convertSelectedComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(convertSelectedComics),
      tap(action =>
        this.logger.trace('Converting selected comic books:', action)
      ),
      switchMap(action =>
        this.libraryService
          .convertSelectedComics({
            archiveType: action.archiveType
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'library.convert-selected-comic-books.effect-success',
                  {
                    archiveType: action.archiveType
                  }
                )
              )
            ),
            map(() => convertComicsSuccess()),
            catchError(error =>
              this.doServiceFailure(
                error,
                'library.convert-selected-comic-books.effect-failure'
              )
            )
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  private doServiceFailure(error: any, errorMessage: string) {
    this.logger.error('Service failure:', error);
    this.alertService.error(this.translateService.instant(errorMessage));
    return of(convertComicsFailure());
  }

  private doGeneralFailure(error: any) {
    this.logger.error('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(convertComicsFailure());
  }
}
