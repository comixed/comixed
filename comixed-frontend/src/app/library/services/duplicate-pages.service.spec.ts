/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { TestBed } from '@angular/core/testing';
import { SetBlockingStateRequest } from 'app/library/models/net/set-blocking-state-request';
import { DuplicatePagesService } from './duplicate-pages.service';
import { DUPLICATE_PAGE_1 } from 'app/library/models/duplicate-page.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from 'app/app.functions';
import {
  GET_ALL_DUPLICATE_PAGES_URL,
  SET_BLOCKING_STATE_URL
} from 'app/library/library.constants';

describe('DuplicatePagesService', () => {
  const PAGES = [DUPLICATE_PAGE_1];
  const HASHES = PAGES.map(page => page.hash);

  let service: DuplicatePagesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DuplicatePagesService]
    });

    service = TestBed.get(DuplicatePagesService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get all duplicate pages', () => {
    service.getAll().subscribe(response => expect(response).toEqual(PAGES));

    const req = httpMock.expectOne(interpolate(GET_ALL_DUPLICATE_PAGES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(PAGES);
  });

  it('can set the blocking state for pages', () => {
    service
      .setBlocking(PAGES, true)
      .subscribe(response => expect(response).toEqual(PAGES));

    const req = httpMock.expectOne(interpolate(SET_BLOCKING_STATE_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      blocked: true,
      hashes: HASHES
    } as SetBlockingStateRequest);
    req.flush(PAGES);
  });
});
