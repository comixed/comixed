/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { DuplicatePageService } from './duplicate-page.service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  LOAD_COMICS_WITH_DUPLICATE_PAGES_URL,
  LOAD_DUPLICATE_PAGE_DETAIL_URL
} from '@app/library/library.constants';
import {
  DUPLICATE_PAGE_1,
  DUPLICATE_PAGE_2,
  DUPLICATE_PAGE_3
} from '@app/library/library.fixtures';
import { LoadDuplicatePageListRequest } from '@app/library/models/net/load-duplicate-page-list-request';
import { LoadDuplicatePageListResponse } from '@app/library/models/net/load-duplicate-page-list-response';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

describe('DuplicatePageService', () => {
  const DETAIL = DUPLICATE_PAGE_1;
  const PAGE_NUMBER = 7;
  const PAGE_SIZE = 10;
  const SORT_FIELD = 'hash';
  const SORT_DIRECTION = 'desc';
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2, DUPLICATE_PAGE_3];
  const TOTAL_PAGES = PAGES.length;

  let service: DuplicatePageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DuplicatePageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load duplicate pages', () => {
    const serviceResponse = {
      total: TOTAL_PAGES,
      pages: PAGES
    } as LoadDuplicatePageListResponse;

    service
      .loadDuplicatePages({
        page: PAGE_NUMBER,
        size: PAGE_SIZE,
        sortBy: SORT_FIELD,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(LOAD_COMICS_WITH_DUPLICATE_PAGES_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      page: PAGE_NUMBER,
      size: PAGE_SIZE,
      sortBy: SORT_FIELD,
      sortDirection: SORT_DIRECTION
    } as LoadDuplicatePageListRequest);
    req.flush(serviceResponse);
  });

  it('can load the detail for a single duplicate page', () => {
    service
      .loadDuplicatePageDetail({ hash: DETAIL.hash })
      .subscribe(response => expect(response).toEqual(DETAIL));

    const req = httpMock.expectOne(
      interpolate(LOAD_DUPLICATE_PAGE_DETAIL_URL, { hash: DETAIL.hash })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(DETAIL);
  });
});
