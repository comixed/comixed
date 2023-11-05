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
import { FetchIssuesForSeriesEffects } from './fetch-issues-for-series.effects';
import { ComicBookScrapingService } from '@app/comic-metadata/services/comic-book-scraping.service';
import {
  fetchIssuesForSeries,
  fetchIssuesForSeriesFailed,
  issuesForSeriesFetched
} from '@app/comic-metadata/actions/fetch-issues-for-series.actions';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { hot } from 'jasmine-marbles';
import {
  METADATA_SOURCE_1,
  SCRAPING_VOLUME_1
} from '@app/comic-metadata/comic-metadata.fixtures';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('FetchIssuesForSeriesEffects', () => {
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1;

  let actions$: Observable<any>;
  let effects: FetchIssuesForSeriesEffects;
  let metadataService: jasmine.SpyObj<ComicBookScrapingService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        FetchIssuesForSeriesEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicBookScrapingService,
          useValue: {
            fetchIssuesForSeries: jasmine.createSpy(
              'ComicBookScrapingService.fetchIssuesForSeries()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(FetchIssuesForSeriesEffects);
    metadataService = TestBed.inject(
      ComicBookScrapingService
    ) as jasmine.SpyObj<ComicBookScrapingService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('fetching issues for a series', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = fetchIssuesForSeries({
        source: METADATA_SOURCE,
        volume: SCRAPING_VOLUME
      });
      const outcome = issuesForSeriesFetched();

      actions$ = hot('-a', { a: action });
      metadataService.fetchIssuesForSeries
        .withArgs({
          source: METADATA_SOURCE,
          volume: SCRAPING_VOLUME
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.fetchIssuesForSeries$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = fetchIssuesForSeries({
        source: METADATA_SOURCE,
        volume: SCRAPING_VOLUME
      });
      const outcome = fetchIssuesForSeriesFailed();

      actions$ = hot('-a', { a: action });
      metadataService.fetchIssuesForSeries
        .withArgs({
          source: METADATA_SOURCE,
          volume: SCRAPING_VOLUME
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.fetchIssuesForSeries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = fetchIssuesForSeries({
        source: METADATA_SOURCE,
        volume: SCRAPING_VOLUME
      });
      const outcome = fetchIssuesForSeriesFailed();

      actions$ = hot('-a', { a: action });
      metadataService.fetchIssuesForSeries
        .withArgs({
          source: METADATA_SOURCE,
          volume: SCRAPING_VOLUME
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.fetchIssuesForSeries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
