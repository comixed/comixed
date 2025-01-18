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
import { PublisherService } from './publisher.service';
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
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  LOAD_PUBLISHER_DETAIL_URL,
  LOAD_PUBLISHERS_URL
} from '@app/collections/collections.constants';
import { LoadPublisherListRequest } from '@app/collections/models/net/load-publisher-list-request';
import { LoadPublisherListResponse } from '@app/collections/models/net/load-publisher-list-response';
import { LoadPublisherDetailRequest } from '@app/collections/models/net/load-publisher-detail-request';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

describe('PublisherService', () => {
  const PAGE_NUMBER = 3;
  const PAGE_SIZE = 50;
  const SORT_BY = 'name';
  const SORT_DIRECTION = 'asc';
  const PUBLISHERS = [PUBLISHER_1, PUBLISHER_2, PUBLISHER_3];
  const PUBLISHER = PUBLISHER_3;
  const DETAIL = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];

  let service: PublisherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PublisherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get the list of publishers', () => {
    const serviceResponse = {
      total: PUBLISHERS.length,
      publishers: PUBLISHERS
    } as LoadPublisherListResponse;

    service
      .loadPublishers({
        page: PAGE_NUMBER,
        size: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_PUBLISHERS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      page: PAGE_NUMBER,
      size: PAGE_SIZE,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadPublisherListRequest);
    req.flush(serviceResponse);
  });

  it('can get details for a single publisher', () => {
    const serviceResponse = DETAIL;

    service
      .loadPublisherDetail({
        name: PUBLISHER.name,
        pageIndex: PAGE_NUMBER,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(LOAD_PUBLISHER_DETAIL_URL, { name: PUBLISHER.name })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageIndex: PAGE_NUMBER,
      pageSize: PAGE_SIZE,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadPublisherDetailRequest);
    req.flush(serviceResponse);
  });
});
