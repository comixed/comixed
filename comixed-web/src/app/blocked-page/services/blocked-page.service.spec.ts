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
import { BlockedPageService } from './blocked-page.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpResponse } from '@angular/common/http';
import { interpolate } from '@app/core';
import { AddBlockedPageRequest } from '@app/library/models/net/add-blocked-page-request';
import { PAGE_1 } from '@app/library/library.fixtures';
import {
  CLEAR_BLOCKED_PAGE_HASH_URL,
  SET_BLOCKED_PAGE_HASH_URL
} from '@app/blocked-page/blocked-page.constants';
import { LoggerModule } from '@angular-ru/logger';

describe('BlockedPageService', () => {
  const PAGE = PAGE_1;

  let service: BlockedPageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(BlockedPageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can block a page', () => {
    service
      .setBlockedState({
        page: PAGE,
        blocked: true
      })
      .subscribe((response: HttpResponse<any>) =>
        expect(response.status).toEqual(200)
      );

    const req = httpMock.expectOne(interpolate(SET_BLOCKED_PAGE_HASH_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      hash: PAGE.hash
    } as AddBlockedPageRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can unblock a page', () => {
    service
      .setBlockedState({
        page: PAGE,
        blocked: false
      })
      .subscribe((response: HttpResponse<any>) =>
        expect(response.status).toEqual(200)
      );

    const req = httpMock.expectOne(
      interpolate(CLEAR_BLOCKED_PAGE_HASH_URL, { hash: PAGE.hash })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });
});
