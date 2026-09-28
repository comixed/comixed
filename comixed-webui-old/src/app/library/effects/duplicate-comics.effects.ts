/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  loadDuplicateComicList,
  loadDuplicateComicListFailure,
  loadDuplicateComicListSuccess,
  loadDuplicateComics,
  loadDuplicateComicsFailure,
  loadDuplicateComicsSuccess
} from '../actions/duplicate-comics.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { DuplicateComicService } from '@app/library/services/duplicate-comic.service';
import { LoadDuplicateComicsListResponse } from '@app/library/models/net/load-duplicate-comics-list-response';
import { of } from 'rxjs';
import { loadComicsSuccess } from '@app/comic-books/actions/comic-list.actions';
import { LoadComicsResponse } from '@app/comic-books/models/net/load-comics-response';

@Injectable()
export class DuplicateComicsEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  duplicateComicService = inject(DuplicateComicService);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);

  loadDuplicateComicList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadDuplicateComicList),
      tap(action => this.logger.debug('Loading duplicate pages:', action)),
      switchMap(action =>
        this.duplicateComicService
          .loadDuplicateComicList({
            pageIndex: action.pageIndex,
            pageSize: action.pageSize,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadDuplicateComicsListResponse) =>
              loadDuplicateComicListSuccess({
                entries: response.comics,
                total: response.totalCount
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'duplicate-comic-list.load-list.effect-failure'
                )
              );
              return of(loadDuplicateComicListFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadDuplicateComicListFailure());
      })
    );
  });

  loadDuplicateComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadDuplicateComics),
      tap(action => this.logger.debug('Loading duplicate comics:', action)),
      switchMap(action =>
        this.duplicateComicService
          .loadDuplicateComics({
            publisher: action.publisher,
            series: action.series,
            volume: action.volume,
            issueNumber: action.issueNumber,
            coverDate: action.coverDate,
            pageIndex: action.pageIndex,
            pageSize: action.pageSize,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            mergeMap((response: LoadComicsResponse) => [
              loadDuplicateComicsSuccess(),
              loadComicsSuccess({
                comics: response.comics,
                coverMonths: response.coverMonths,
                coverYears: response.coverYears,
                totalCount: response.totalCount,
                filteredCount: response.filteredCount
              })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'duplicate-comics.load-duplicate-comics.effect-failure'
                )
              );
              return of(loadDuplicateComicsFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadDuplicateComicsFailure());
      })
    );
  });
}
