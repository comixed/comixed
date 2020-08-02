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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { HttpResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { interpolate } from 'app/app.functions';
import {
  CLEAR_METADATA_URL,
  DELETE_COMIC_URL,
  GET_COMIC_URL,
  GET_FORMATS_URL,
  GET_PAGE_TYPES_URL,
  GET_SCAN_TYPES_URL,
  MARK_COMIC_AS_READ_URL,
  MARK_PAGE_DELETED_URL,
  RESTORE_COMIC_URL,
  SAVE_COMIC_URL,
  UNMARK_PAGE_DELETED_URL
} from 'app/comics/comics.constants';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import { BACK_COVER, FRONT_COVER } from 'app/comics/models/page-type.fixtures';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5
} from 'app/comics/models/scan-type.fixtures';

import { ComicService } from './comic.service';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { LoggerModule } from '@angular-ru/logger';
import { PAGE_2 } from 'app/comics/comics.fixtures';

describe('ComicService', () => {
  const COMIC = COMIC_1;
  const SKIP_CACHE = false;
  const LAST_READ_DATE = COMIC_1_LAST_READ_DATE;
  const PAGE = PAGE_2;

  let service: ComicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [ComicService]
    });

    service = TestBed.get(ComicService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get the list of scan types', () => {
    const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5];

    service
      .getScanTypes()
      .subscribe(response => expect(response).toEqual(SCAN_TYPES));

    const req = httpMock.expectOne(interpolate(GET_SCAN_TYPES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(SCAN_TYPES);
  });

  it('can get the list of formats', () => {
    const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];

    service
      .getFormats()
      .subscribe(response => expect(response).toEqual(FORMATS));

    const req = httpMock.expectOne(interpolate(GET_FORMATS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(FORMATS);
  });

  it('can get the list of page types', () => {
    const PAGE_TYPES = [FRONT_COVER, BACK_COVER];

    service
      .getPageTypes()
      .subscribe(response => expect(response).toEqual(PAGE_TYPES));

    const req = httpMock.expectOne(interpolate(GET_PAGE_TYPES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(PAGE_TYPES);
  });

  it('can get an issue', () => {
    service
      .getIssue(COMIC.id)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(GET_COMIC_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(COMIC);
  });

  it('can save a comic', () => {
    service
      .saveComic(COMIC)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(SAVE_COMIC_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(COMIC);
    req.flush(COMIC);
  });

  it('can clear the metadata for a comic', () => {
    service
      .clearMetadata(COMIC)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(CLEAR_METADATA_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(COMIC);
  });

  it('can delete a comic', () => {
    service
      .deleteComic(COMIC)
      .subscribe((response: HttpResponse<boolean>) =>
        expect(response.status).toEqual(200)
      );

    const req = httpMock.expectOne(
      interpolate(DELETE_COMIC_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(
      new HttpResponse<boolean>({ status: 200, statusText: 'SUCCESS' })
    );
  });

  it('can restore a comic', () => {
    service
      .restoreComic(COMIC)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(RESTORE_COMIC_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});
    req.flush(COMIC);
  });

  it('can mark a comic as read', () => {
    service
      .markAsRead(COMIC, true)
      .subscribe(response => expect(response).toEqual(LAST_READ_DATE));

    const req = httpMock.expectOne(
      interpolate(MARK_COMIC_AS_READ_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('PUT');
    req.flush(LAST_READ_DATE);
  });

  it('can unmark a comic as read', () => {
    service
      .markAsRead(COMIC, false)
      .subscribe(response => expect(response).toBeNull());

    const req = httpMock.expectOne(
      interpolate(MARK_COMIC_AS_READ_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(null);
  });

  it('can mark a page as deleted', () => {
    service
      .deletePage(PAGE, true)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(MARK_PAGE_DELETED_URL, {
        id: PAGE.id
      })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(COMIC);
  });

  it('can unmark a page as deleted', () => {
    service
      .deletePage(PAGE, false)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(UNMARK_PAGE_DELETED_URL, {
        id: PAGE.id
      })
    );
    expect(req.request.method).toEqual('POST');
    req.flush(COMIC);
  });
});
