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

import { ComicBookService } from './comic-book.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import {
  LOAD_COMIC_URL,
  OLD_LOAD_COMICS_URL,
  UPDATE_COMIC_URL
} from '@app/library/library.constants';
import { interpolate } from '@app/core';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { OldLoadComicsResponse } from '@app/comic-books/models/net/old-load-comics-response';
import { OldLoadComicsRequest } from '@app/comic-books/models/net/old-load-comics-request';
import {
  DELETE_SELECTED_COMIC_BOOKS_URL,
  DELETE_SINGLE_COMIC_BOOK_URL,
  MARK_PAGES_DELETED_URL,
  MARK_PAGES_UNDELETED_URL,
  SAVE_PAGE_ORDER_URL,
  UNDELETE_SELECTED_COMIC_BOOKS_URL,
  UNDELETE_SINGLE_COMIC_BOOK_URL
} from '@app/comic-books/comic-books.constants';
import { HttpResponse } from '@angular/common/http';
import { PAGE_1 } from '@app/comic-pages/comic-pages.fixtures';
import { MarkPagesDeletedRequest } from '@app/comic-books/models/net/mark-pages-deleted-request';
import { SavePageOrderRequest } from '@app/comic-books/models/net/save-page-order-request';

describe('ComicBookService', () => {
  const COMIC_DETAIL = COMIC_DETAIL_2;
  const COMIC_BOOKS = [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5];
  const MAX_RECORDS = 1000;
  const LAST_ID = Math.floor(Math.abs(Math.random() * 1000));
  const LAST_PAGE = Math.random() > 0.5;
  const PAGE = PAGE_1;

  let service: ComicBookService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ComicBookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load a batch of comics', () => {
    service
      .loadBatch({ maxRecords: MAX_RECORDS, lastId: LAST_ID })
      .subscribe(response =>
        expect(response).toEqual({
          comicBooks: COMIC_BOOKS,
          lastId: LAST_ID,
          lastPayload: LAST_PAGE
        } as OldLoadComicsResponse)
      );

    const req = httpMock.expectOne(interpolate(OLD_LOAD_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      maxRecords: MAX_RECORDS,
      lastId: LAST_ID
    } as OldLoadComicsRequest);
    req.flush({
      comicBooks: COMIC_BOOKS,
      lastId: LAST_ID,
      lastPayload: LAST_PAGE
    } as OldLoadComicsResponse);
  });

  it('can load a single comic', () => {
    service
      .loadOne({ id: COMIC_DETAIL.comicId })
      .subscribe(response => expect(response).toEqual(COMIC_DETAIL));

    const req = httpMock.expectOne(
      interpolate(LOAD_COMIC_URL, { id: COMIC_DETAIL.comicId })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(COMIC_DETAIL);
  });

  it('can update a single comic', () => {
    service
      .updateOne({ comicBook: COMIC_BOOK_1 })
      .subscribe(response => expect(response).toEqual(COMIC_BOOK_2));

    const req = httpMock.expectOne(
      interpolate(UPDATE_COMIC_URL, { id: COMIC_BOOK_1.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(COMIC_BOOK_1);
    req.flush(COMIC_BOOK_2);
  });

  it('can delete a single comic book', () => {
    service
      .deleteSingleComicBook({ comicBookId: COMIC_DETAIL.comicId })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(DELETE_SINGLE_COMIC_BOOK_URL, {
        comicBookId: COMIC_DETAIL.comicId
      })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can undelete a single comic book', () => {
    service
      .undeleteSingleComicBook({ comicBookId: COMIC_DETAIL.comicId })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(UNDELETE_SINGLE_COMIC_BOOK_URL, {
        comicBookId: COMIC_DETAIL.comicId
      })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can delete the selected comic books', () => {
    service
      .deleteSelectedComicBooks()
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(DELETE_SELECTED_COMIC_BOOKS_URL)
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can undelete the selected comic books', () => {
    service
      .undeleteSelectedComicBooks()
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(UNDELETE_SELECTED_COMIC_BOOKS_URL)
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can mark pages for deletion', () => {
    service
      .updatePageDeletion({
        pages: [PAGE],
        deleted: true
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(MARK_PAGES_DELETED_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: [PAGE.id],
      deleted: true
    } as MarkPagesDeletedRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can unmark pages for deletion', () => {
    service
      .updatePageDeletion({
        pages: [PAGE],
        deleted: false
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(MARK_PAGES_UNDELETED_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: [PAGE.id],
      deleted: false
    } as MarkPagesDeletedRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can save the page order', () => {
    service
      .savePageOrder({
        comicBook: COMIC_BOOK_1,
        entries: [{ index: 0, filename: PAGE.filename }]
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(SAVE_PAGE_ORDER_URL, { id: COMIC_BOOK_1.id })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      entries: [{ index: 0, filename: PAGE.filename }]
    } as SavePageOrderRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });
});
