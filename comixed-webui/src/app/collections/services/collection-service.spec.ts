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

import { TestBed } from '@angular/core/testing';
import { CollectionService } from './collection-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideRouter } from '@angular/router';
import { interpolate } from '@app/app-functions';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  LOAD_PUBLISHER_LIST_URL,
  LOAD_SERIES_LIST_URL
} from '@app/collections/collections-contants';
import { LoadPublisherListRequest } from '@app/collections/models/net/load-publisher-list-request';
import { PUBLISHER_1, SERIES_1 } from '@app/collections/collections-fixtures';
import { LoadPublisherListResponse } from '@app/collections/models/net/load-publisher-list-response';
import { LoadSeriesListResponse } from '@app/collections/models/net/load-series-list-response';
import { LoadSeriesListRequest } from '@app/collections/models/net/load-series-list-request';

describe('CollectionService', () => {
  const TEST_SEARCH_TEXT = 'text to search for';
  const TEST_INDEX = 3;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'name';
  const TEST_SORT_DIRECTION = 'asc';
  const TEST_COLLECTION_TOTAL_COUNT = 17;
  const TEST_PUBLISHER_LIST = [PUBLISHER_1];
  const TEST_SERIES_LIST = [SERIES_1];

  let service: CollectionService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '*',
            redirectTo: ''
          }
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });
    service = TestBed.inject(CollectionService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loading publishers', () => {
    it('success', async () => {
      const updateStateSpy = vi.spyOn(
        service.publisherStore,
        'updatePublishers'
      );
      const serverResponse = {
        publishers: TEST_PUBLISHER_LIST,
        total: TEST_COLLECTION_TOTAL_COUNT
      } as LoadPublisherListResponse;

      service.loadPublishers({
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });

      const req = httpController.expectOne(
        interpolate(LOAD_PUBLISHER_LIST_URL)
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      } as LoadPublisherListRequest);
      req.flush(serverResponse);
      httpController.verify();
      expect(updateStateSpy).toHaveBeenCalledWith(
        TEST_PUBLISHER_LIST,
        TEST_COLLECTION_TOTAL_COUNT
      );
    });
  });

  describe('loading series', () => {
    it('success', async () => {
      const updateStateSpy = vi.spyOn(service.seriesStore, 'updateSeries');
      const serverResponse = {
        series: TEST_SERIES_LIST,
        total: TEST_COLLECTION_TOTAL_COUNT
      } as LoadSeriesListResponse;

      service.loadSeries({
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });

      const req = httpController.expectOne(interpolate(LOAD_SERIES_LIST_URL));
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        searchText: TEST_SEARCH_TEXT,
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      } as LoadSeriesListRequest);
      req.flush(serverResponse);
      httpController.verify();
      expect(updateStateSpy).toHaveBeenCalledWith(
        TEST_SERIES_LIST,
        TEST_COLLECTION_TOTAL_COUNT
      );
    });
  });
});
