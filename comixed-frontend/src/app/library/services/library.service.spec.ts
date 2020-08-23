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

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { interpolate } from 'app/app.functions';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/models/comic.fixtures';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';
import { GetLibraryUpdatesRequest } from 'app/library/models/net/get-library-updates-request';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { LoggerModule } from '@angular-ru/logger';

import { LibraryService } from './library.service';
import {
  CLEAR_IMAGE_CACHE_URL,
  CONSOLIDATE_LIBRARY_URL,
  CONVERT_COMICS_URL,
  DELETE_MULTIPLE_COMICS_URL,
  GET_LIBRARY_UPDATES_URL,
  START_RESCAN_URL,
  UNDELETE_MULTIPLE_COMICS_URL
} from 'app/library/library.constants';
import { HttpResponse } from '@angular/common/http';
import { ConvertComicsRequest } from 'app/library/models/net/convert-comics-request';
import { ConsolidateLibraryRequest } from 'app/library/models/net/consolidate-library-request';
import { ClearImageCacheResponse } from 'app/library/models/net/clear-image-cache-response';
import { UndeleteMultipleComicsResponse } from 'app/library/models/net/undelete-multiple-comics-response';
import { UndeleteMultipleComicsRequest } from 'app/library/models/net/undelete-multiple-comics-request';

describe('LibraryService', () => {
  const LAST_UPDATED_DATE = new Date();
  const MORE_UPDATES = true;
  const LAST_COMIC_ID = 229;
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
  const DIRECTORY = '/Users/comixedreader/Documents/comics';
  const RENAMING_RULE =
    '$PUBLISHER/$SERIES/$VOLUME/$SERIES v$VOLUME #$ISSUE [$COVERDATE]';
  const COMIC_IDS = [3, 20, 9, 21, 4, 17];

  let service: LibraryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [LibraryService]
    });

    service = TestBed.get(LibraryService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get updates from the library', () => {
    const PENDING_IMPORTS = 7;
    const PENDING_RESCANS = 17;
    const PROCESSING_COUNT = 32;
    const RESCAN_COUNT = 66;
    const READING_LISTS = [];
    const RESPONSE: GetLibraryUpdateResponse = {
      comics: COMICS,
      lastComicId: LAST_COMIC_ID,
      mostRecentUpdate: LAST_UPDATED_DATE,
      moreUpdates: MORE_UPDATES,
      lastReadDates: LAST_READ_DATES,
      processingCount: PENDING_IMPORTS,
      readingLists: READING_LISTS
    };

    service
      .getUpdatesSince(
        LAST_UPDATED_DATE,
        LAST_COMIC_ID,
        MAXIMUM_RECORDS,
        PROCESSING_COUNT,
        TIMEOUT
      )
      .subscribe(response => expect(response).toEqual(RESPONSE));

    const req = httpMock.expectOne(interpolate(GET_LIBRARY_UPDATES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      lastUpdatedDate: LAST_UPDATED_DATE.getTime(),
      lastComicId: LAST_COMIC_ID,
      maximumComics: MAXIMUM_RECORDS,
      processingCount: PROCESSING_COUNT,
      timeout: TIMEOUT
    } as GetLibraryUpdatesRequest);
    req.flush(RESPONSE);
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
    const IDS = COMIC_IDS;

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

  it('can undelete multiple comics', () => {
    const IDS = COMIC_IDS;

    service.undeleteMultipleComics(IDS).subscribe(response => {
      expect(response).toEqual({
        success: true
      } as UndeleteMultipleComicsResponse);
    });

    const req = httpMock.expectOne(interpolate(UNDELETE_MULTIPLE_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: COMIC_IDS
    } as UndeleteMultipleComicsRequest);
    req.flush({ success: true } as UndeleteMultipleComicsResponse);
  });

  it('can convert comics', () => {
    service
      .convertComics(COMICS, 'CBZ', true, false, false)
      .subscribe((response: HttpResponse<any>) =>
        expect(response.status).toEqual(200)
      );

    const req = httpMock.expectOne(interpolate(CONVERT_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: COMICS.map(comic => comic.id),
      archiveType: 'CBZ',
      renamePages: true,
      deletePages: false,
      deleteOriginal: false
    } as ConvertComicsRequest);
    req.flush(
      new HttpResponse<any>({ status: 200 })
    );
  });

  it('can consolidate the library', () => {
    service
      .moveComics(true, DIRECTORY, RENAMING_RULE)
      .subscribe(response => expect(response).toEqual(COMICS));

    const req = httpMock.expectOne(interpolate(CONSOLIDATE_LIBRARY_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      deletePhysicalFiles: true,
      targetDirectory: DIRECTORY,
      renamingRule: RENAMING_RULE
    } as ConsolidateLibraryRequest);
    req.flush(COMICS);
  });

  it('can clear the image cache', () => {
    const RESPONSE = { success: true } as ClearImageCacheResponse;
    service
      .clearImageCache()
      .subscribe(response => expect(response).toEqual(RESPONSE));

    const req = httpMock.expectOne(interpolate(CLEAR_IMAGE_CACHE_URL));
    expect(req.request.method).toEqual('DELETE');
    req.flush(RESPONSE);
  });
});
