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
import { PublisherEffects } from './publisher.effects';
import {
  PUBLISHER_1,
  PUBLISHER_2,
  PUBLISHER_3,
  SERIES_1,
  SERIES_2,
  SERIES_3,
  SERIES_4,
  SERIES_5
} from '@app/collections/collections.fixtures';
import { PublisherService } from '@app/collections/services/publisher.service';
import {
  loadPublisherDetail,
  loadPublisherDetailFailure,
  loadPublisherDetailSuccess,
  loadPublisherList,
  loadPublisherListFailure,
  loadPublisherListSuccess
} from '@app/collections/actions/publisher.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadPublisherListResponse } from '@app/collections/models/net/load-publisher-list-response';
import { LoadPublisherDetailResponse } from '@app/collections/models/net/load-publisher-detail-response';

describe('PublisherEffects', () => {
  const SEARCH_TEXT = 'some text';
  const PAGE_NUMBER = 1;
  const PAGE_SIZE = 25;
  const SORT_BY = 'name';
  const SORT_DIRECTION = 'asc';
  const PUBLISHERS = [PUBLISHER_1, PUBLISHER_2, PUBLISHER_3];
  const PUBLISHER = PUBLISHER_3;
  const SERIES_LIST = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];
  const TOTAL_SERIES = SERIES_LIST.length;

  let actions$: Observable<any>;
  let effects: PublisherEffects;
  let publisherService: jasmine.SpyObj<PublisherService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        PublisherEffects,
        provideMockActions(() => actions$),
        {
          provide: PublisherService,
          useValue: {
            loadPublishers: jasmine.createSpy(
              'PublisherService.loadPublishers()'
            ),
            loadPublisherDetail: jasmine.createSpy(
              'PublisherService.loadPublisherDetail()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(PublisherEffects);
    publisherService = TestBed.inject(
      PublisherService
    ) as jasmine.SpyObj<PublisherService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading all publishers', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        total: PUBLISHERS.length,
        publishers: PUBLISHERS
      } as LoadPublisherListResponse;
      const action = loadPublisherList({
        searchText: SEARCH_TEXT,
        page: PAGE_NUMBER,
        size: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadPublisherListSuccess({
        total: PUBLISHERS.length,
        publishers: PUBLISHERS
      });

      actions$ = hot('-a', { a: action });
      publisherService.loadPublishers
        .withArgs({
          searchText: SEARCH_TEXT,
          page: PAGE_NUMBER,
          size: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPublishers$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadPublisherList({
        searchText: SEARCH_TEXT,
        page: PAGE_NUMBER,
        size: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadPublisherListFailure();

      actions$ = hot('-a', { a: action });
      publisherService.loadPublishers
        .withArgs({
          searchText: SEARCH_TEXT,
          page: PAGE_NUMBER,
          size: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPublishers$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadPublisherList({
        searchText: SEARCH_TEXT,
        page: PAGE_NUMBER,
        size: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadPublisherListFailure();

      actions$ = hot('-a', { a: action });
      publisherService.loadPublishers
        .withArgs({
          searchText: SEARCH_TEXT,
          page: PAGE_NUMBER,
          size: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadPublishers$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading a single publisher', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        totalSeries: TOTAL_SERIES,
        entries: SERIES_LIST
      } as LoadPublisherDetailResponse;
      const action = loadPublisherDetail({
        name: PUBLISHER.name,
        pageIndex: PAGE_NUMBER,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadPublisherDetailSuccess({
        totalSeries: TOTAL_SERIES,
        detail: SERIES_LIST
      });

      actions$ = hot('-a', { a: action });
      publisherService.loadPublisherDetail
        .withArgs({
          name: PUBLISHER.name,
          pageIndex: PAGE_NUMBER,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPublisherDetail$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadPublisherDetail({
        name: PUBLISHER.name,
        pageIndex: PAGE_NUMBER,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadPublisherDetailFailure();

      actions$ = hot('-a', { a: action });
      publisherService.loadPublisherDetail
        .withArgs({
          name: PUBLISHER.name,
          pageIndex: PAGE_NUMBER,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPublisherDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadPublisherDetail({
        name: PUBLISHER.name,
        pageIndex: PAGE_NUMBER,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadPublisherDetailFailure();

      actions$ = hot('-a', { a: action });
      publisherService.loadPublisherDetail
        .withArgs({
          name: PUBLISHER.name,
          pageIndex: PAGE_NUMBER,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadPublisherDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
