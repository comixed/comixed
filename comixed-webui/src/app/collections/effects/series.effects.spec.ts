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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { SeriesEffects } from './series.effects';
import {
  ISSUE_1,
  ISSUE_2,
  ISSUE_3,
  SERIES_1,
  SERIES_2,
  SERIES_3,
  SERIES_4,
  SERIES_5
} from '@app/collections/collections.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { AlertService } from '@app/core/services/alert.service';
import { SeriesService } from '@app/collections/services/series.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoadSeriesListResponse } from '@app/collections/models/net/load-series-list-response';
import {
  loadSeriesDetail,
  loadSeriesDetailFailed,
  loadSeriesFailed,
  loadSeriesList,
  seriesDetailLoaded,
  seriesLoaded
} from '@app/collections/actions/series.actions';
import { hot } from 'jasmine-marbles';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

describe('SeriesEffects', () => {
  const SERIES_LIST = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];
  const SERIES_DETAIL = [ISSUE_1, ISSUE_2, ISSUE_3];
  const PUBLISHER = 'The publisher';
  const SERIES = 'The series';
  const VOLUME = '2022';

  let actions$: Observable<any>;
  let effects: SeriesEffects;
  let seriesService: jasmine.SpyObj<SeriesService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        SeriesEffects,
        provideMockActions(() => actions$),
        {
          provide: SeriesService,
          useValue: {
            loadSeries: jasmine.createSpy('SeriesService.loadSeries()'),
            fetchIssuesForSeries: jasmine.createSpy(
              'SeriesService.fetchIssuesForSeries()'
            ),
            loadSeriesDetail: jasmine.createSpy(
              'SeriesService.loadSeriesDetail()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(SeriesEffects);
    seriesService = TestBed.inject(
      SeriesService
    ) as jasmine.SpyObj<SeriesService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading series', () => {
    it('fires an action on success', () => {
      const serviceResponse = { series: SERIES_LIST } as LoadSeriesListResponse;
      const action = loadSeriesList();
      const outcome = seriesLoaded({ series: SERIES_LIST });

      actions$ = hot('-a', { a: action });
      seriesService.loadSeries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSeriesList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadSeriesList();
      const outcome = loadSeriesFailed();

      actions$ = hot('-a', { a: action });
      seriesService.loadSeries.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSeriesList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadSeriesList();
      const outcome = loadSeriesFailed();

      actions$ = hot('-a', { a: action });
      seriesService.loadSeries.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadSeriesList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading a single series', () => {
    it('fires an action on success', () => {
      const serviceResponse = SERIES_DETAIL;
      const action = loadSeriesDetail({
        publisher: PUBLISHER,
        name: SERIES,
        volume: VOLUME
      });
      const outcome = seriesDetailLoaded({ detail: SERIES_DETAIL });

      actions$ = hot('-a', { a: action });
      seriesService.loadSeriesDetail
        .withArgs({
          publisher: PUBLISHER,
          name: SERIES,
          volume: VOLUME
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSeriesDetail$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadSeriesDetail({
        publisher: PUBLISHER,
        name: SERIES,
        volume: VOLUME
      });
      const outcome = loadSeriesDetailFailed();

      actions$ = hot('-a', { a: action });
      seriesService.loadSeriesDetail
        .withArgs({
          publisher: PUBLISHER,
          name: SERIES,
          volume: VOLUME
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSeriesDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadSeriesDetail({
        publisher: PUBLISHER,
        name: SERIES,
        volume: VOLUME
      });
      const outcome = loadSeriesDetailFailed();

      actions$ = hot('-a', { a: action });
      seriesService.loadSeriesDetail
        .withArgs({
          publisher: PUBLISHER,
          name: SERIES,
          volume: VOLUME
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadSeriesDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
