/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { LibraryService } from './library.service';
import { COMIC_1, COMIC_3, COMIC_5 } from '@app/comic/comic.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';
import { interpolate } from '@app/core';
import { LOAD_COMICS_URL } from '@app/library/library.constants';
import { LoadComicsResponse } from '@app/library/models/net/load-comics-response';
import { LoadComicsRequest } from '@app/library/models/net/load-comics-request';

describe('LibraryService', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_ID = Math.floor(Math.abs(Math.random() * 1000));
  const LAST_PAGE = Math.random() > 0.5;

  let service: LibraryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(LibraryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('can load a batch of comics', () => {
    service.loadBatch({ lastId: LAST_ID }).subscribe(response =>
      expect(response).toEqual({
        comics: COMICS,
        lastId: LAST_ID,
        lastPayload: LAST_PAGE
      } as LoadComicsResponse)
    );

    const req = httpMock.expectOne(interpolate(LOAD_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ lastId: LAST_ID } as LoadComicsRequest);
    req.flush({
      comics: COMICS,
      lastId: LAST_ID,
      lastPayload: LAST_PAGE
    } as LoadComicsResponse);
  });
});
