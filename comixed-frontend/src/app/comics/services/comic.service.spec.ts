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

import { ComicService } from './comic.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import { interpolate } from 'app/app.functions';
import {
  CLEAR_METADATA_URL,
  DELETE_COMIC_URL,
  GET_FORMATS_URL,
  GET_ISSUE_URL,
  GET_PAGE_TYPES_URL,
  GET_SCAN_TYPES_URL,
  SAVE_COMIC_URL,
  SCRAPE_COMIC_URL
} from 'app/comics/comics.constants';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5
} from 'app/comics/models/scan-type.fixtures';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import { BACK_COVER, FRONT_COVER } from 'app/comics/models/page-type.fixtures';
import { HttpResponse } from '@angular/common/http';
import { ComicScrapeRequest } from 'app/comics/models/net/comic-scrape-request';

describe('ComicService', () => {
  const COMIC = COMIC_1;
  const API_KEY = 'ABCDEF0123456789';
  const ISSUE_ID = 44147;
  const SKIP_CACHE = false;

  let service: ComicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
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
      interpolate(GET_ISSUE_URL, { id: COMIC.id })
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

  it('can scrape a comic', () => {
    service
      .scrapeComic(COMIC, API_KEY, ISSUE_ID, SKIP_CACHE)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(interpolate(SCRAPE_COMIC_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      comicId: COMIC.id,
      apiKey: API_KEY,
      issueId: ISSUE_ID,
      skipCache: SKIP_CACHE
    } as ComicScrapeRequest);
    req.flush(COMIC);
  });
});
