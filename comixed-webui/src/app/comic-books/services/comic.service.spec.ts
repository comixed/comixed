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
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { DISPLAYABLE_COMIC_2 } from '@app/comic-books/comic-books.fixtures';
import {
  LOAD_COMIC_URL,
  UPDATE_COMIC_URL
} from '@app/library/library.constants';
import { interpolate } from '@app/core';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  DELETE_SELECTED_COMICS_URL,
  DELETE_SINGLE_COMIC_URL,
  DOWNLOAD_COMIC_URL,
  MARK_PAGES_DELETED_URL,
  MARK_PAGES_UNDELETED_URL,
  SAVE_PAGE_ORDER_URL,
  UNDELETE_SELECTED_COMICS_URL,
  UNDELETE_SINGLE_COMIC_URL
} from '@app/comic-books/comic-books.constants';
import {
  HttpResponse,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { PAGE_1 } from '@app/comic-pages/comic-pages.fixtures';
import { MarkPagesDeletedRequest } from '@app/comic-books/models/net/mark-pages-deleted-request';
import { SavePageOrderRequest } from '@app/comic-books/models/net/save-page-order-request';
import { DownloadDocument } from '@app/core/models/download-document';
import { UpdateComicRequest } from '@app/comic-books/models/net/update-comic-request';

describe('ComicService', () => {
  const COMIC = DISPLAYABLE_COMIC_2;
  const PAGE = PAGE_1;
  const DOWNLOAD_COMIC = {
    filename: COMIC.filename,
    content: 'content',
    mediaType: 'application/octet'
  } as DownloadDocument;

  let service: ComicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ComicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load a single comic', () => {
    service
      .loadOne({ id: COMIC.comicId })
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(LOAD_COMIC_URL, { id: COMIC.comicId })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(COMIC);
  });

  it('can update a single comic', () => {
    service
      .updateOne({
        comicId: COMIC.comicId,
        comicType: COMIC.comicType,
        publisher: COMIC.publisher,
        series: COMIC.series,
        volume: COMIC.volume,
        issueNumber: COMIC.issueNumber,
        imprint: COMIC.imprint,
        sortName: COMIC.sortName,
        title: COMIC.title,
        coverDate: COMIC.coverDate,
        storeDate: COMIC.storeDate
      })
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(UPDATE_COMIC_URL, { id: COMIC.comicId })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      comicType: COMIC.comicType,
      publisher: COMIC.publisher,
      series: COMIC.series,
      volume: COMIC.volume,
      issueNumber: COMIC.issueNumber,
      imprint: COMIC.imprint,
      sortName: COMIC.sortName,
      title: COMIC.title,
      coverDate: COMIC.coverDate,
      storeDate: COMIC.storeDate
    } as UpdateComicRequest);
    req.flush(COMIC);
  });

  it('can delete a single comic book', () => {
    service
      .deleteSingleComicBook({ comicId: COMIC.comicId })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(DELETE_SINGLE_COMIC_URL, {
        comicId: COMIC.comicId
      })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can undelete a single comic book', () => {
    service
      .undeleteSingleComicBook({ comicId: COMIC.comicId })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(UNDELETE_SINGLE_COMIC_URL, {
        comicId: COMIC.comicId
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

    const req = httpMock.expectOne(interpolate(DELETE_SELECTED_COMICS_URL));
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can undelete the selected comic books', () => {
    service
      .undeleteSelectedComicBooks()
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(UNDELETE_SELECTED_COMICS_URL));
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
      ids: [PAGE.comicPageId],
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
      ids: [PAGE.comicPageId],
      deleted: false
    } as MarkPagesDeletedRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can save the page order', () => {
    service
      .savePageOrder({
        comicId: COMIC.comicId,
        entries: [{ index: 0, filename: PAGE.filename }]
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(SAVE_PAGE_ORDER_URL, { id: COMIC.comicId })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      entries: [{ index: 0, filename: PAGE.filename }]
    } as SavePageOrderRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can download a comic book file', () => {
    service
      .downloadComicBook({ comicId: COMIC.comicId })
      .subscribe(response => expect(response).toEqual(DOWNLOAD_COMIC));

    const req = httpMock.expectOne(
      interpolate(DOWNLOAD_COMIC_URL, {
        comicId: COMIC.comicId
      })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(DOWNLOAD_COMIC);
  });
});
