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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { MetricsEffects } from './metrics.effects';
import { MetricsService } from '@app/admin/services/metrics.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { METRIC_DETAIL, METRIC_LIST } from '@app/admin/admin.fixtures';
import {
  loadMetricDetails,
  loadMetricDetailsFailed,
  loadMetricList,
  loadMetricListFailed,
  metricDetailsLoaded,
  metricListLoaded
} from '@app/admin/actions/metrics.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('MetricsEffects', () => {
  let actions$: Observable<any>;
  let effects: MetricsEffects;
  let metricService: jasmine.SpyObj<MetricsService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        MetricsEffects,
        provideMockActions(() => actions$),
        {
          provide: MetricsService,
          useValue: {
            loadMetricList: jasmine.createSpy('MetricService.loadMetricList()'),
            loadMetricDetail: jasmine.createSpy(
              'MetricService.loadMetricDetail()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(MetricsEffects);
    metricService = TestBed.inject(
      MetricsService
    ) as jasmine.SpyObj<MetricsService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the metric list', () => {
    it('fires an action on success', () => {
      const serviceResponse = METRIC_LIST;
      const action = loadMetricList();
      const outcome = metricListLoaded({ list: METRIC_LIST });

      actions$ = hot('-a', { a: action });
      metricService.loadMetricList.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetricList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadMetricList();
      const outcome = loadMetricListFailed();

      actions$ = hot('-a', { a: action });
      metricService.loadMetricList.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetricList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadMetricList();
      const outcome = loadMetricListFailed();

      actions$ = hot('-a', { a: action });
      metricService.loadMetricList.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadMetricList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading the details for a metric', () => {
    it('fires an action on success', () => {
      const serviceResponse = METRIC_DETAIL;
      const action = loadMetricDetails({ name: METRIC_DETAIL.name });
      const outcome = metricDetailsLoaded({ detail: METRIC_DETAIL });

      actions$ = hot('-a', { a: action });
      metricService.loadMetricDetail
        .withArgs({ name: METRIC_DETAIL.name })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetricDetail$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadMetricDetails({ name: METRIC_DETAIL.name });
      const outcome = loadMetricDetailsFailed();

      actions$ = hot('-a', { a: action });
      metricService.loadMetricDetail
        .withArgs({ name: METRIC_DETAIL.name })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetricDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadMetricDetails({ name: METRIC_DETAIL.name });
      const outcome = loadMetricDetailsFailed();

      actions$ = hot('-a', { a: action });
      metricService.loadMetricDetail
        .withArgs({ name: METRIC_DETAIL.name })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadMetricDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
