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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  addSingleComicSelection,
  clearComicSelectionState,
  clearComicSelectionStateFailed,
  comicSelectionsLoaded,
  comicSelectionStateCleared,
  loadComicSelections,
  loadComicSelectionsFailed,
  removeSingleComicSelection,
  setComicSelectionByUnreadState,
  setDuplicateComicsSelectionState,
  setMultipleComicByFilterSelectionState,
  setMultipleComicByIdSelectionState,
  setMultipleComicByPublisherSelectionState,
  setMultipleComicByPublisherSeriesAndVolumeSelectionState,
  setMultipleComicsByTagTypeAndValueSelectionState,
  setMultipleComicSelectionStateFailure,
  setMultipleComicSelectionStateSuccess,
  singleComicSelectionFailed,
  singleComicSelectionUpdated
} from '../actions/comic-book-selection.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicSelectionService } from '@app/comic-books/services/comic-selection.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class ComicSelectionEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  comicSelectionService = inject(ComicSelectionService);
  setSelectedByFilter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setMultipleComicByFilterSelectionState),
      tap(action =>
        this.logger.debug('Selecting multiple comic books by filter:', action)
      ),
      switchMap(action =>
        this.comicSelectionService
          .setSelectedByFilter({
            coverYear: action.coverYear,
            coverMonth: action.coverMonth,
            archiveType: action.archiveType,
            comicType: action.comicType,
            comicState: action.comicState,
            unscrapedState: action.unscrapedState,
            searchText: action.searchText,
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => setMultipleComicSelectionStateSuccess()),
            catchError(error => this.doMultipleSelectedServiceFailure(error))
          )
      ),
      catchError(error => this.doMultipleSelectedGeneralFailure(error))
    );
  });

  setSelectedByTagTypeAndValue$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setMultipleComicsByTagTypeAndValueSelectionState),
      tap(action =>
        this.logger.debug(
          'Selecting multiple comic books by tag type and value:',
          action
        )
      ),
      switchMap(action =>
        this.comicSelectionService
          .setSelectedByTagTypeAndValue({
            tagType: action.tagType,
            tagValue: action.tagValue,
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => setMultipleComicSelectionStateSuccess()),
            catchError(error => this.doMultipleSelectedServiceFailure(error))
          )
      ),
      catchError(error => this.doMultipleSelectedGeneralFailure(error))
    );
  });

  setSelectedById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setMultipleComicByIdSelectionState),
      tap(action =>
        this.logger.debug('Selecting multiple comic books by id:', action)
      ),
      switchMap(action =>
        this.comicSelectionService
          .setSelectedById({
            comicIds: action.comicIds,
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => setMultipleComicSelectionStateSuccess()),
            catchError(error => this.doMultipleSelectedServiceFailure(error))
          )
      ),
      catchError(error => this.doMultipleSelectedGeneralFailure(error))
    );
  });

  setSelectedByPublisher$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setMultipleComicByPublisherSelectionState),
      tap(action =>
        this.logger.debug(
          'Selecting multiple comic books by publisher:',
          action
        )
      ),
      switchMap(action =>
        this.comicSelectionService
          .setSelectedByPublisher({
            publisher: action.publisher,
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => setMultipleComicSelectionStateSuccess()),
            catchError(error => this.doMultipleSelectedServiceFailure(error))
          )
      ),
      catchError(error => this.doMultipleSelectedGeneralFailure(error))
    );
  });

  setSelectedByPublisherSeriesAndVolume$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setMultipleComicByPublisherSeriesAndVolumeSelectionState),
      tap(action =>
        this.logger.debug(
          'Selecting multiple comic books by publisher, series, and volume:',
          action
        )
      ),
      switchMap(action =>
        this.comicSelectionService
          .setSelectedByPublisherSeriesAndVolume({
            publisher: action.publisher,
            series: action.series,
            volume: action.volume,
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => setMultipleComicSelectionStateSuccess()),
            catchError(error => this.doMultipleSelectedServiceFailure(error))
          )
      ),
      catchError(error => this.doMultipleSelectedGeneralFailure(error))
    );
  });

  setDuplicateComicsSelectionState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setDuplicateComicsSelectionState),
      tap(action =>
        this.logger.debug('Selecting all duplicate comic books:', action)
      ),
      switchMap(action =>
        this.comicSelectionService
          .setDuplicateComicsSelectionState({
            selected: action.selected
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => setMultipleComicSelectionStateSuccess()),
            catchError(error => this.doMultipleSelectedServiceFailure(error))
          )
      ),
      catchError(error => this.doMultipleSelectedGeneralFailure(error))
    );
  });

  setUnreadComicsSelectionState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setComicSelectionByUnreadState),
      tap(action =>
        this.logger.debug('Selecting comic books by unread state:', action)
      ),
      switchMap(action =>
        this.comicSelectionService
          .setUnreadComicsSelectionState({
            selected: action.selected,
            unreadOnly: action.unreadOnly
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => setMultipleComicSelectionStateSuccess()),
            catchError(error => this.doMultipleSelectedServiceFailure(error))
          )
      ),
      catchError(error => this.doMultipleSelectedGeneralFailure(error))
    );
  });
  alertService = inject(AlertService);
  translateService = inject(TranslateService);
  loadSelections$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicSelections),
      tap(() => this.logger.debug('Loading comic book selectsion')),
      switchMap(() =>
        this.comicSelectionService.loadSelections().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: number[]) => comicSelectionsLoaded({ ids: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'selection.load-selections.effect-failure'
              )
            );
            return of(loadComicSelectionsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicSelectionsFailed());
      })
    );
  });
  addSingleSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addSingleComicSelection),
      tap(action => this.logger.debug('Adding a single comic book:', action)),
      switchMap(action =>
        this.comicSelectionService
          .addSingleSelection({
            comicId: action.comicId
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => singleComicSelectionUpdated()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'selection.set-single-state.effect-failure'
                )
              );
              return of(singleComicSelectionFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(singleComicSelectionFailed());
      })
    );
  });
  removeSingleSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(removeSingleComicSelection),
      tap(action => this.logger.debug('Removing a single comic book:', action)),
      switchMap(action =>
        this.comicSelectionService
          .removeSingleSelection({
            comicId: action.comicId
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => singleComicSelectionUpdated()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'selection.set-single-state.effect-failure'
                )
              );
              return of(singleComicSelectionFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(singleComicSelectionFailed());
      })
    );
  });
  clearSelections$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearComicSelectionState),
      tap(() => this.logger.debug('Clearing comic book selectsion')),
      switchMap(() =>
        this.comicSelectionService.clearSelections().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(() => comicSelectionStateCleared()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'selection.clear-selection-state.effect-failure'
              )
            );
            return of(clearComicSelectionStateFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(clearComicSelectionStateFailed());
      })
    );
  });

  private doMultipleSelectedServiceFailure(error: any) {
    this.logger.error('Service failure:', error);
    this.alertService.error(
      this.translateService.instant(
        'selection.set-multiple-state.effect-failure'
      )
    );
    return of(setMultipleComicSelectionStateFailure());
  }

  private doMultipleSelectedGeneralFailure(error: any) {
    this.logger.error('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(setMultipleComicSelectionStateFailure());
  }
}
