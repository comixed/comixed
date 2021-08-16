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
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';
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

describe('DuplicatePageService', () => {
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2, DUPLICATE_PAGE_3];
  const DETAIL = DUPLICATE_PAGE_1;

  let service: DuplicatePageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(DuplicatePageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load duplicate pages', () => {
    service
      .loadDuplicatePages()
      .subscribe(response => expect(response).toEqual(PAGES));

    const req = httpMock.expectOne(
      interpolate(LOAD_COMICS_WITH_DUPLICATE_PAGES_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(PAGES);
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
