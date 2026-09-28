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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  loadSeriesDetail,
  loadSeriesDetailFailure,
  loadSeriesDetailSuccess,
  loadSeriesList,
  loadSeriesListFailure,
  loadSeriesListSuccess
} from '../actions/series.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { SeriesService } from '@app/collections/services/series.service';
import { LoadSeriesListResponse } from '@app/collections/models/net/load-series-list-response';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Issue } from '@app/collections/models/issue';

@Injectable()
export class SeriesEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  seriesService = inject(SeriesService);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);

  loadSeriesList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadSeriesList),
      tap(action => this.logger.debug('Loading series:', action)),
      switchMap(action =>
        this.seriesService
          .loadSeries({
            searchText: action.searchText,
            pageIndex: action.pageIndex,
            pageSize: action.pageSize,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadSeriesListResponse) =>
              loadSeriesListSuccess({
                series: response.series,
                totalSeries: response.totalSeries
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'collections.series.load-series.effect-failure'
                )
              );
              return of(loadSeriesListFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadSeriesListFailure());
      })
    );
  });
  loadSeriesDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadSeriesDetail),
      tap(action => this.logger.debug('Loading series detail:', action)),
      switchMap(action =>
        this.seriesService
          .loadSeriesDetail({
            publisher: action.publisher,
            name: action.name,
            volume: action.volume
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: Issue[]) =>
              loadSeriesDetailSuccess({ detail: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'collections.series-detail.load-effect-failure'
                )
              );
              return of(loadSeriesDetailFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadSeriesDetailFailure());
      })
    );
  });
}
