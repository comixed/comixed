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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { TestBed } from '@angular/core/testing';

import { PageService } from './page.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { PAGE_1 } from 'app/comics/models/page.fixtures';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import { interpolate } from 'app/app.functions';
import {
  BLOCK_PAGE_HASH_URL,
  SAVE_PAGE_URL,
  UNBLOCK_PAGE_HASH_URL
} from 'app/comics/comics.constants';

describe('PageService', () => {
  const PAGE = PAGE_1;
  const COMIC = COMIC_1;

  let service: PageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PageService]
    });

    service = TestBed.get(PageService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can save a page', () => {
    service
      .savePage(PAGE)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(interpolate(SAVE_PAGE_URL, { id: PAGE.id }));
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(PAGE);
    req.flush(COMIC);
  });

  describe('setting page hash blocking', () => {
    it('can block pages by hash', () => {
      service
        .setPageHashBlocking(PAGE, true)
        .subscribe(response => expect(response).toEqual(COMIC));

      const req = httpMock.expectOne(
        interpolate(BLOCK_PAGE_HASH_URL, {
          id: PAGE.id,
          hash: PAGE.hash
        })
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({ hash: PAGE.hash });
      req.flush(COMIC);
    });

    it('can unblock pages by hash', () => {
      service
        .setPageHashBlocking(PAGE, false)
        .subscribe(response => expect(response).toEqual(COMIC));

      const req = httpMock.expectOne(
        interpolate(UNBLOCK_PAGE_HASH_URL, {
          id: PAGE.id,
          hash: PAGE.hash
        })
      );
      expect(req.request.method).toEqual('DELETE');
      req.flush(COMIC);
    });
  });
});
