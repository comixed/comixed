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
import {
  loadMetricDetails,
  loadMetricDetailsFailed,
  loadMetricList,
  loadMetricListFailed,
  metricDetailsLoaded,
  metricListLoaded
} from '@app/admin/actions/metrics.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MetricsService } from '@app/admin/services/metrics.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { MetricList } from '@app/admin/models/metric-list';
import { of } from 'rxjs';
import { MetricDetail } from '@app/admin/models/metric-detail';

@Injectable()
export class MetricsEffects {
  loadMetricList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadMetricList),
      tap(() => this.logger.debug('Loading metric list')),
      switchMap(() =>
        this.metricsService.loadMetricList().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: MetricList) => metricListLoaded({ list: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metrics.metric-list.effect-failure'
              )
            );
            return of(loadMetricListFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadMetricListFailed());
      })
    );
  });

  loadMetricDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadMetricDetails),
      tap(action => this.logger.debug('Loading details for metric:', action)),
      switchMap(action =>
        this.metricsService.loadMetricDetail({ name: action.name }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: MetricDetail) =>
            metricDetailsLoaded({ detail: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metrics.metric-details.effect-failure',
                { name: action.name }
              )
            );
            return of(loadMetricDetailsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadMetricDetailsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private metricsService: MetricsService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
