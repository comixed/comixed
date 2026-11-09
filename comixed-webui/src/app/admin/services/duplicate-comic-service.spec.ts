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
import { DuplicateComicService } from './duplicate-comic-service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';
import { LoadDuplicateComicListRequest } from '@app/library/models/net/load-duplicate-comic-list-request';
import { interpolate } from '@app/app-functions';
import { LoadDuplicateComicResponse } from '@app/library/models/net/load-duplicate-comic-response';
import { LoadDuplicateComicRequest } from '@app/library/models/net/load-duplicate-comic-request';
import {
  LOAD_DUPLICATE_COMIC_LIST_URL,
  LOAD_DUPLICATE_COMIC_URL
} from '@app/admin/admin-constants';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2
} from '@app/admin/admin-fixtures';

describe('DuplicateComicService', () => {
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const TEST_DUPLICATE_COMIC_LIST = [DUPLICATE_COMIC_1, DUPLICATE_COMIC_2];
  const TEST_INDEX = 17;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'coverDate';
  const TEST_SORT_DIRECTION = 'asc';
  const TEST_COVER_MONTHS = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEARS = [1965, 1971, 1986, 1996, 1998, 2006];
  const TEST_TOTAL = 61;
  const TEST_FILTER_COUNT = 55;
  const TEST_PUBLISHER = 'The Publisher';
  const TEST_SERIES = 'The Series';
  const TEST_VOLUME = '2026';
  const TEST_ISSUE_NUMBER = '717';
  const TEST_COVER_DATE = new Date().getTime();

  let service: DuplicateComicService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(DuplicateComicService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load the list of duplicate comics', () => {
    const serverResponse = TEST_DUPLICATE_COMIC_LIST;

    service
      .loadAll({
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(LOAD_DUPLICATE_COMIC_LIST_URL)
    );
    expect(req.request.method).toStrictEqual('POST');
    expect(req.request.body).toStrictEqual({
      pageIndex: TEST_INDEX,
      pageSize: TEST_SIZE,
      sortBy: TEST_SORT_BY,
      sortDirection: TEST_SORT_DIRECTION
    } as LoadDuplicateComicListRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should load one duplicate comic', () => {
    const serverResponse = {
      comics: TEST_COMIC_LIST,
      coverMonths: TEST_COVER_MONTHS,
      coverYears: TEST_COVER_YEARS,
      totalCount: TEST_TOTAL,
      filteredCount: TEST_FILTER_COUNT
    } as LoadDuplicateComicResponse;

    service
      .loadOne({
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        issueNumber: TEST_ISSUE_NUMBER,
        coverDate: TEST_COVER_DATE,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(interpolate(LOAD_DUPLICATE_COMIC_URL));
    expect(req.request.method).toStrictEqual('POST');
    expect(req.request.body).toStrictEqual({
      publisher: TEST_PUBLISHER,
      series: TEST_SERIES,
      volume: TEST_VOLUME,
      issueNumber: TEST_ISSUE_NUMBER,
      coverDate: TEST_COVER_DATE,
      pageIndex: TEST_INDEX,
      pageSize: TEST_SIZE,
      sortBy: TEST_SORT_BY,
      sortDirection: TEST_SORT_DIRECTION
    } as LoadDuplicateComicRequest);
    req.flush(serverResponse);
    httpController.verify();
  });
});
