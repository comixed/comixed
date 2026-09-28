/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { ComicListActions } from '../actions/comic-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { LibraryService } from '@app/library/services/library-service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/services/alert-service';

@Injectable()
export class ComicListEffects {
  readonly logger = inject(LoggerService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  readonly libraryService = inject(LibraryService);
  private actions$ = inject(Actions);
  loadComicListByFilters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicListActions.loadByFilters),
      tap(action => this.logger.debug('Loading comics by filter:', action)),
      switchMap(action =>
        this.libraryService
          .loadComicListByFilter({
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            coverYear: action.coverYear,
            coverMonth: action.coverMonth,
            archiveType: action.archiveType,
            comicType: action.comicType,
            comicState: action.comicState,
            selected: action.selected,
            missing: action.missing,
            unscrapedState: action.unscrapedState,
            searchText: action.searchText,
            publisher: action.publisher,
            series: action.series,
            volume: action.volume,
            pageCount: action.pageCount,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              ComicListActions.loadSuccess({
                comicList: response.comics,
                totalCount: response.totalCount,
                filterCount: response.filteredCount,
                coverMonthList: response.coverMonths,
                coverYearList: response.coverYears
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-list-effect.load-by-filter.service-failure'
                )
              );
              return of(ComicListActions.loadFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('Service failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effect.general-failure')
        );
        return of(ComicListActions.loadFailure());
      })
    );
  });
}
