/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  clearComicBookSelectionState,
  clearComicBookSelectionStateFailed,
  comicBookSelectionsLoaded,
  comicBookSelectionStateCleared,
  loadComicBookSelections,
  loadComicBookSelectionsFailed,
  multipleComicBookSelectionStateSet,
  setMultipleComicBookSelectionState,
  setMultipleComicBookSelectionStateFailed,
  setSingleComicBookSelectionState,
  setSingleComicBookSelectionStateFailed,
  singleComicBookSelectionStateSet
} from '../actions/comic-book-selection.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookSelectionService } from '@app/comic-books/services/comic-book-selection.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class ComicBookSelectionEffects {
  loadSelections$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicBookSelections),
      tap(() => this.logger.debug('Loading comic book selectsion')),
      switchMap(() =>
        this.comicBookSelectionService.loadSelections().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: number[]) =>
            comicBookSelectionsLoaded({ ids: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'selection.load-selections.effect-failure'
              )
            );
            return of(loadComicBookSelectionsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicBookSelectionsFailed());
      })
    );
  });

  setSingleState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setSingleComicBookSelectionState),
      tap(action =>
        this.logger.debug('Selecting a single comic book:', action)
      ),
      switchMap(action =>
        this.comicBookSelectionService
          .setSingleState({
            id: action.id,
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => singleComicBookSelectionStateSet()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'selection.set-single-state.effect-failure'
                )
              );
              return of(setSingleComicBookSelectionStateFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(setSingleComicBookSelectionStateFailed());
      })
    );
  });

  setMultipleState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setMultipleComicBookSelectionState),
      tap(action =>
        this.logger.debug('Selecting multiple comic books:', action)
      ),
      switchMap(action =>
        this.comicBookSelectionService
          .setMultipleState({
            coverYear: action.coverYear,
            coverMonth: action.coverMonth,
            archiveType: action.archiveType,
            comicType: action.comicType,
            comicState: action.comicState,
            readState: action.readState,
            unscrapedState: action.unscrapedState,
            searchText: action.searchText,
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => multipleComicBookSelectionStateSet()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'selection.set-multiple-state.effect-failure'
                )
              );
              return of(setMultipleComicBookSelectionStateFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(setMultipleComicBookSelectionStateFailed());
      })
    );
  });

  clearSelections$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearComicBookSelectionState),
      tap(() => this.logger.debug('Clearing comic book selectsion')),
      switchMap(() =>
        this.comicBookSelectionService.clearSelections().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(() => comicBookSelectionStateCleared()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'selection.clear-selection-state.effect-failure'
              )
            );
            return of(clearComicBookSelectionStateFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(clearComicBookSelectionStateFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicBookSelectionService: ComicBookSelectionService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
