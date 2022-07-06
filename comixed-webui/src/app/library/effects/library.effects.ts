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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LibraryService } from '@app/library/services/library.service';
import {
  editMultipleComics,
  editMultipleComicsFailed,
  libraryStateLoaded,
  loadLibraryState,
  loadLibraryStateFailed,
  multipleComicsEdited
} from '@app/library/actions/library.actions';
import { LibraryState as RemoteLibraryState } from '@app/library/models/net/library-state';

@Injectable()
export class LibraryEffects {
  loadLibraryState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadLibraryState),
      tap(action => this.logger.trace('Loading library state:', action)),
      switchMap(() =>
        this.libraryService.loadLibraryState().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: RemoteLibraryState) =>
            libraryStateLoaded({ state: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library.load-library-state.effect-failure'
              )
            );
            return of(loadLibraryStateFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadLibraryStateFailed());
      })
    );
  });

  editMultipleComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(editMultipleComics),
      tap(action => this.logger.trace('Editing multiple comics:', action)),
      switchMap(action =>
        this.libraryService
          .editMultipleComics({
            comicBooks: action.comicBooks,
            details: action.details
          })
          .pipe(
            tap(response => this.logger.trace('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'library.edit-multiple-comics.effect-success'
                )
              )
            ),
            map(() => multipleComicsEdited()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'library.edit-multiple-comics.effect-failure'
                )
              );
              return of(editMultipleComicsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(editMultipleComicsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private libraryService: LibraryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
