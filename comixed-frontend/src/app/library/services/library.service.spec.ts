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

import { LibraryService } from './library.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ScanType } from 'app/comics/models/scan-type';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5,
  SCAN_TYPE_7
} from 'app/comics/models/scan-type.fixtures';
import { interpolate } from 'app/app.functions';
import {
  CLEAR_METADATA_URL,
  DELETE_MULTIPLE_COMICS_URL,
  GET_FORMATS_URL,
  GET_SCAN_TYPES_URL,
  GET_UPDATES_URL,
  SET_BLOCKED_PAGE_HASH_URL,
  START_RESCAN_URL,
  UPDATE_COMIC_URL
} from 'app/app.constants';
import { ComicFormat } from 'app/comics/models/comic-format';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/models/comic.fixtures';
import { Comic } from 'app/comics/models/comic';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { BlockedPageResponse } from 'app/library/models/net/blocked-page-response';
import { generate_random_string } from '../../../test/testing-utils';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';
import { GetLibraryUpdatesRequest } from 'app/library/models/net/get-library-updates-request';

describe('LibraryService', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5, SCAN_TYPE_7];
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];
  const COMIC = COMIC_1;
  const HASH = generate_random_string();
  const TIMESTAMP = new Date().getTime();
  const TIMEOUT = Math.floor(Math.random() * 3000);
  const MAXIMUM_RECORDS = Math.floor(Math.random() * 1000);

  let service: LibraryService;
  let http_mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LibraryService]
    });

    service = TestBed.get(LibraryService);
    http_mock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get the list of scan types', () => {
    service.getScanTypes().subscribe((response: ScanType[]) => {
      expect(response).toEqual(SCAN_TYPES);
    });

    const req = http_mock.expectOne(interpolate(GET_SCAN_TYPES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(SCAN_TYPES);
  });

  it('can get the list of formats', () => {
    service.getFormats().subscribe((response: ComicFormat[]) => {
      expect(response).toEqual(FORMATS);
    });

    const req = http_mock.expectOne(interpolate(GET_FORMATS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(FORMATS);
  });

  it('can get updates from the library', () => {
    const COMICS = [COMIC_1, COMIC_3, COMIC_5];
    const PENDING_IMPORTS = 7;
    const PENDING_RESCANS = 17;

    service
      .getUpdatesSince(TIMESTAMP, TIMEOUT, MAXIMUM_RECORDS)
      .subscribe((response: GetLibraryUpdateResponse) => {});

    const req = http_mock.expectOne(
      interpolate(GET_UPDATES_URL, { timestamp: TIMESTAMP })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      timeout: TIMEOUT,
      maximumResults: MAXIMUM_RECORDS
    } as GetLibraryUpdatesRequest);
    req.flush({
      comics: COMICS,
      processingCount: PENDING_IMPORTS,
      rescanCount: PENDING_RESCANS
    } as GetLibraryUpdateResponse);
  });

  it('can start a rescan', () => {
    const COUNT = 29;

    service.startRescan().subscribe((response: StartRescanResponse) => {
      expect(response.count).toEqual(COUNT);
    });

    const req = http_mock.expectOne(interpolate(START_RESCAN_URL));
    expect(req.request.method).toEqual('POST');
    req.flush({ count: COUNT } as StartRescanResponse);
  });

  it('can update a comic', () => {
    service.saveComic(COMIC).subscribe((response: Comic) => {
      expect(response).toEqual(COMIC);
    });

    const req = http_mock.expectOne(
      interpolate(UPDATE_COMIC_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(COMIC);
    req.flush(COMIC);
  });

  it('can clear the metadata from a comic', () => {
    service.clearComicMetadata(COMIC).subscribe((response: Comic) => {
      expect(response).toEqual(COMIC);
    });

    const req = http_mock.expectOne(
      interpolate(CLEAR_METADATA_URL, { id: COMIC.id })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(COMIC);
  });

  it('can block a page hash', () => {
    service
      .setPageHashBlockedState(HASH, true)
      .subscribe((response: BlockedPageResponse) => {
        expect(response.hash).toEqual(HASH);
        expect(response.blocked).toBeTruthy();
      });

    const req = http_mock.expectOne(
      interpolate(SET_BLOCKED_PAGE_HASH_URL, { hash: HASH })
    );
    expect(req.request.method).toEqual('POST');
    req.flush({ hash: HASH, blocked: true });
  });

  it('can unblock a page hash', () => {
    service
      .setPageHashBlockedState(HASH, false)
      .subscribe((response: BlockedPageResponse) => {
        expect(response.hash).toEqual(HASH);
        expect(response.blocked).toBeFalsy();
      });

    const req = http_mock.expectOne(
      interpolate(SET_BLOCKED_PAGE_HASH_URL, { hash: HASH })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush({ hash: HASH, blocked: false });
  });

  it('can delete multiple comics', () => {
    const IDS = [3, 20, 9, 21, 4, 17];

    service
      .deleteMultipleComics(IDS)
      .subscribe((response: DeleteMultipleComicsResponse) => {
        expect(response.count).toEqual(IDS.length);
      });

    const req = http_mock.expectOne(interpolate(DELETE_MULTIPLE_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('comic_ids')).toEqual(IDS.toString());
    req.flush({ count: IDS.length } as DeleteMultipleComicsResponse);
  });
});
