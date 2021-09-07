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

import { ComicService } from './comic.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_5
} from '@app/comic-book/comic-book.fixtures';
import {
  LOAD_COMIC_URL,
  LOAD_COMICS_URL,
  UPDATE_COMIC_URL
} from '@app/library/library.constants';
import { interpolate } from '@app/core';
import { LoggerModule } from '@angular-ru/logger';
import { LoadComicsResponse } from '@app/comic-book/models/net/load-comics-response';
import { LoadComicsRequest } from '@app/comic-book/models/net/load-comics-request';
import {
  MARK_COMICS_DELETED_URL,
  MARK_COMICS_UNDELETED_URL,
  UPDATE_COMIC_INFO_URL
} from '@app/comic-book/comic-book.constants';
import { MarkComicsDeletedRequest } from '@app/comic-book/models/net/mark-comics-deleted-request';
import { HttpResponse } from '@angular/common/http';
import { MarkComicsUndeletedRequest } from '@app/comic-book/models/net/mark-comics-undeleted-request';

describe('ComicService', () => {
  const COMIC = COMIC_2;
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_ID = Math.floor(Math.abs(Math.random() * 1000));
  const LAST_PAGE = Math.random() > 0.5;

  let service: ComicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ComicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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

  it('can load a single comic', () => {
    service
      .loadOne({ id: COMIC.id })
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(LOAD_COMIC_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(COMIC);
  });

  it('can update a single comic', () => {
    service
      .updateOne({ comic: COMIC })
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(UPDATE_COMIC_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(COMIC);
    req.flush(COMIC);
  });

  it('can mark comics for deletion', () => {
    service
      .markComicsDeleted({
        comics: COMICS,
        deleted: true
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(MARK_COMICS_DELETED_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: COMICS.map(comic => comic.id)
    } as MarkComicsDeletedRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can unmark comics for deletion', () => {
    service
      .markComicsDeleted({
        comics: COMICS,
        deleted: false
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(MARK_COMICS_UNDELETED_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: COMICS.map(comic => comic.id)
    } as MarkComicsUndeletedRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });
});
