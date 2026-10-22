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
import { LoadPublisherListRequest } from '@app/library/models/net/load-publisher-list-request';
import { LoadPublisherListResponse } from '@app/library/models/net/load-publisher-list-response';
import { LoadSeriesListResponse } from '@app/library/models/net/load-series-list-response';
import { LoadSeriesListRequest } from '@app/library/models/net/load-series-list-request';
import { LoadCollectionEntriesResponse } from '@app/library/models/net/load-collection-entries-response';
import { LoadCollectionEntriesRequest } from '@app/library/models/net/load-collection-entries-request';
import { LoadSeriesDetailRequest } from '@app/library/models/net/load-series-detail-request';
import {
  LOAD_COLLECTION_ENTRIES_URL,
  LOAD_PUBLISHER_LIST_URL,
  LOAD_SERIES_DETAIL_URL,
  LOAD_SERIES_LIST_URL
} from '@app/library/library-constants';
import {
  COLLECTION_ENTRY_1,
  ISSUE_1,
  PUBLISHER_1,
  SERIES_1
} from '@app/library/library-fixtures';

describe('CollectionService', () => {
  const TEST_SEARCH_TEXT = 'text to search for';
  const TEST_INDEX = 3;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'name';
  const TEST_SORT_DIRECTION = 'asc';
  const TEST_COLLECTION_TOTAL_COUNT = 17;
  const TEST_PUBLISHER = PUBLISHER_1;
  const TEST_PUBLISHER_LIST = [TEST_PUBLISHER];
  const TEST_SERIES = SERIES_1;
  const TEST_SERIES_LIST = [TEST_SERIES];
  const TEST_ISSUE = ISSUE_1;
  const TEST_ISSUE_LIST = [TEST_ISSUE];
  const TEST_COLLECTION_ENTRY_LIST = [COLLECTION_ENTRY_1];

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

  it('should load the publisher list', async () => {
    const serverResponse = {
      publishers: TEST_PUBLISHER_LIST,
      total: TEST_COLLECTION_TOTAL_COUNT
    } as LoadPublisherListResponse;

    service
      .loadPublisherList({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(interpolate(LOAD_PUBLISHER_LIST_URL));
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
  });

  describe('loading the series list', () => {
    it('success', async () => {
      const updateStateSpy = vi.spyOn(service.seriesListStore, 'update');
      const serverResponse = {
        series: TEST_SERIES_LIST,
        total: TEST_COLLECTION_TOTAL_COUNT
      } as LoadSeriesListResponse;

      service.loadSeriesList({
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

  describe('loading series detail', () => {
    it('success', async () => {
      const updateStateSpy = vi.spyOn(service.seriesDetailStore, 'update');
      const serverResponse = TEST_ISSUE_LIST;

      service.loadSeriesDetail({
        publisherName: TEST_SERIES.publisher,
        seriesName: TEST_SERIES.name,
        volume: TEST_SERIES.volume
      });

      const req = httpController.expectOne(interpolate(LOAD_SERIES_DETAIL_URL));
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        publisher: TEST_SERIES.publisher,
        name: TEST_SERIES.name,
        volume: TEST_SERIES.volume
      } as LoadSeriesDetailRequest);
      req.flush(serverResponse);
      httpController.verify();
      expect(updateStateSpy).toHaveBeenCalledWith(TEST_ISSUE_LIST);
    });
  });

  describe('loading the collection entry list', () => {
    it('success', async () => {
      const updateStateSpy = vi.spyOn(service.tagStore, 'update');
      const serverResponse = {
        entries: TEST_COLLECTION_ENTRY_LIST,
        totalEntries: TEST_COLLECTION_TOTAL_COUNT
      } as LoadCollectionEntriesResponse;

      service.loadCollectionEntryList({
        tagType: COLLECTION_ENTRY_1.tagType,
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });

      const req = httpController.expectOne(
        interpolate(LOAD_COLLECTION_ENTRIES_URL, {
          tagType: COLLECTION_ENTRY_1.tagType
        })
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        searchText: TEST_SEARCH_TEXT,
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      } as LoadCollectionEntriesRequest);
      req.flush(serverResponse);
      httpController.verify();
      expect(updateStateSpy).toHaveBeenCalledWith(
        TEST_COLLECTION_ENTRY_LIST,
        TEST_COLLECTION_TOTAL_COUNT
      );
    });
  });
});
