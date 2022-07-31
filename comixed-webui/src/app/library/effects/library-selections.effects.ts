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
import {
  clearSelectedComicBooks,
  comicBookSelectionsUpdated,
  deselectComicBooks,
  selectComicBooks,
  updateComicBookSelectionsFailed
} from '../actions/library-selections.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibrarySelectionsService } from '@app/library/services/library-selections.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class LibrarySelectionsEffects {
  selectComicBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(selectComicBooks),
      tap(action => this.logger.trace('Selecting comic books:', action)),
      switchMap(action =>
        this.librarySelectionsService
          .updateComicBookSelections({ ids: action.ids, adding: true })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: number[]) =>
              comicBookSelectionsUpdated({ ids: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'library-selections.select-comic-books.effect-failure'
                )
              );
              return of(updateComicBookSelectionsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(updateComicBookSelectionsFailed());
      })
    );
  });

  deselectComicBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deselectComicBooks),
      tap(action => this.logger.trace('Deselecting comic books:', action)),
      switchMap(action =>
        this.librarySelectionsService
          .updateComicBookSelections({ ids: action.ids, adding: false })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: number[]) =>
              comicBookSelectionsUpdated({ ids: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'library-selections.select-comic-books.effect-failure'
                )
              );
              return of(updateComicBookSelectionsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(updateComicBookSelectionsFailed());
      })
    );
  });

  clearSelectedComicBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearSelectedComicBooks),
      tap(action =>
        this.logger.trace('Clearing selected comic books:', action)
      ),
      switchMap(action =>
        this.librarySelectionsService.clearSelections().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(() => comicBookSelectionsUpdated({ ids: [] })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library-selections.clear-selected-comic-books.effect-failure'
              )
            );
            return of(updateComicBookSelectionsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(updateComicBookSelectionsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private librarySelectionsService: LibrarySelectionsService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
