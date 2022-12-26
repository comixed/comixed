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
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  loadSeriesDetail,
  loadSeriesDetailFailed,
  loadSeriesFailed,
  loadSeriesList,
  seriesDetailLoaded,
  seriesLoaded
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
  loadSeriesList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadSeriesList),
      tap(action => this.logger.debug('Loading series:', action)),
      switchMap(action =>
        this.seriesService.loadSeries().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: LoadSeriesListResponse) =>
            seriesLoaded({ series: response.series })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'collections.series.load-series.effect-failure'
              )
            );
            return of(loadSeriesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadSeriesFailed());
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
              seriesDetailLoaded({ detail: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'collections.series-detail.load-effect-failure'
                )
              );
              return of(loadSeriesDetailFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadSeriesDetailFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private seriesService: SeriesService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
