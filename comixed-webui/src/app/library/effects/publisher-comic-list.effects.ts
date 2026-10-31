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
import { PublisherComicListActions } from '../actions/publisher-comic-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryService } from '@app/library/services/library-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class PublisherComicListEffects {
  readonly logger = inject(LoggerService);
  readonly libraryService = inject(LibraryService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PublisherComicListActions.load),
      tap(action => this.logger.debug('Loading publisher comic list:', action)),
      switchMap(action =>
        this.libraryService
          .loadComicListByFilter({
            pageIndex: action.index,
            pageSize: action.size,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: null,
            selected: false,
            missing: false,
            unscrapedState: false,
            searchText: null,
            publisher: action.publisherName,
            series: null,
            volume: null,
            pageCount: null,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              PublisherComicListActions.loadSuccess({
                entries: response.comics,
                coverMonthList: response.coverMonths,
                coverYearList: response.coverYears,
                total: response.totalCount,
                filteredTotal: response.filteredCount
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'publisher-comic-list-effects.load.service-failure'
                )
              );
              return of(PublisherComicListActions.loadFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(PublisherComicListActions.loadFailure());
      })
    );
  });
}
