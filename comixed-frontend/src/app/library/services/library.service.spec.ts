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

import { TestBed } from '@angular/core/testing';

import { LibraryService } from './library.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from 'app/app.functions';
import {
  DELETE_MULTIPLE_COMICS_URL,
  GET_COMICS_URL,
  GET_UPDATES_URL,
  START_RESCAN_URL
} from 'app/app.constants';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/models/comic.fixtures';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';
import { GetLibraryUpdatesRequest } from 'app/library/models/net/get-library-updates-request';
import { GetComicsResponse } from 'app/library/models/net/get-comics-response';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { GetComicsRequest } from 'app/library/models/net/get-comics-request';

describe('LibraryService', () => {
  const TIMESTAMP = new Date().getTime();
  const TIMEOUT = Math.floor(Math.random() * 3000);
  const MAXIMUM_RECORDS = Math.floor(Math.random() * 1000);
  const PAGE = 17;
  const COUNT = 100;
  const SORT_FIELD = 'series';
  const ASCENDING = false;
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const COMIC_COUNT = 2372;
  const LATEST_UPDATED_DATE = new Date();

  let service: LibraryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LibraryService]
    });

    service = TestBed.get(LibraryService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get comics', () => {
    const RESPONSE = {
      comics: COMICS,
      lastReadDates: LAST_READ_DATES,
      latestUpdatedDate: LATEST_UPDATED_DATE,
      comicCount: COMIC_COUNT
    } as GetComicsResponse;
    service
      .getComics(PAGE, COUNT, SORT_FIELD, ASCENDING)
      .subscribe(response => expect(response).toEqual(RESPONSE));

    const req = httpMock.expectOne(interpolate(GET_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      page: PAGE,
      count: COUNT,
      sortField: SORT_FIELD,
      ascending: ASCENDING
    } as GetComicsRequest);
    req.flush(RESPONSE);
  });

  it('can get updates from the library', () => {
    const PENDING_IMPORTS = 7;
    const PENDING_RESCANS = 17;
    const PROCESSING_COUNT = 32;
    const RESCAN_COUNT = 66;

    service
      .getUpdatesSince(
        TIMESTAMP,
        TIMEOUT,
        MAXIMUM_RECORDS,
        PROCESSING_COUNT,
        RESCAN_COUNT
      )
      .subscribe((response: GetLibraryUpdateResponse) => {});

    const req = httpMock.expectOne(
      interpolate(GET_UPDATES_URL, { timestamp: TIMESTAMP })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      timeout: TIMEOUT,
      maximumResults: MAXIMUM_RECORDS,
      lastProcessingCount: PROCESSING_COUNT,
      lastRescanCount: RESCAN_COUNT
    } as GetLibraryUpdatesRequest);
    req.flush({
      comics: COMICS,
      processingCount: PENDING_IMPORTS,
      rescanCount: PENDING_RESCANS
    } as GetLibraryUpdateResponse);
  });

  it('can start a rescan', () => {
    service.startRescan().subscribe((response: StartRescanResponse) => {
      expect(response.count).toEqual(COUNT);
    });

    const req = httpMock.expectOne(interpolate(START_RESCAN_URL));
    expect(req.request.method).toEqual('POST');
    req.flush({ count: COUNT } as StartRescanResponse);
  });

  it('can delete multiple comics', () => {
    const IDS = [3, 20, 9, 21, 4, 17];

    service
      .deleteMultipleComics(IDS)
      .subscribe((response: DeleteMultipleComicsResponse) => {
        expect(response.count).toEqual(IDS.length);
      });

    const req = httpMock.expectOne(interpolate(DELETE_MULTIPLE_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('comic_ids')).toEqual(IDS.toString());
    req.flush({ count: IDS.length } as DeleteMultipleComicsResponse);
  });
});
