/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import { DuplicateComicService } from './duplicate-comic.service';
import { interpolate } from '@app/core';
import { LoadDuplicateComicsRequest } from '@app/library/models/net/load-duplicate-comics-request';
import { LoadDuplicateComicsResponse } from '@app/library/models/net/load-duplicate-comics-response';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2,
  DUPLICATE_COMIC_3,
  DUPLICATE_COMIC_4,
  DUPLICATE_COMIC_5
} from '@app/library/library.fixtures';
import { LOAD_DUPLICATE_COMICS_URL } from '@app/library/library.constants';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

describe('DuplicateComicService', () => {
  const COMIC_LIST = [
    DUPLICATE_COMIC_1,
    DUPLICATE_COMIC_2,
    DUPLICATE_COMIC_3,
    DUPLICATE_COMIC_4,
    DUPLICATE_COMIC_5
  ];
  const PAGE_SIZE = 25;
  const PAGE_INDEX = 4;
  const SORT_BY = '';
  const SORT_DIRECTION = '';

  let service: DuplicateComicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DuplicateComicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load duplicate comics', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      totalCount: COMIC_LIST.length
    } as LoadDuplicateComicsResponse;

    service
      .loadDuplicateComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_DUPLICATE_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadDuplicateComicsRequest);
    req.flush(serviceResponse);
  });
});
