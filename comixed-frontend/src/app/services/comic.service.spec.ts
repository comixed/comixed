/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import { inject, TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { UserServiceMock } from './user.service.mock';
import { ComicService } from './comic.service';
import { ScanType } from 'app/models/comics/scan-type';
import {
  FIRST_SCAN_TYPE,
  FOURTH_SCAN_TYPE,
  THIRD_SCAN_TYPE
} from 'app/models/comics/scan-type.fixtures';
import {
  COMIC_FORMAT_TYPES_URL,
  COMIC_SCAN_TYPES_URL,
  COMIC_SET_FORMAT_TYPE_URL,
  COMIC_SET_SCAN_TYPE_URL,
  COMIC_SET_SORT_NAME_URL,
  interpolate,
  LIBRARY_STATE_URL,
  COMIC_DELETE_URL,
  COMIC_SUMMARY_URL,
  PAGE_TYPES_URL,
  PAGE_TYPE_URL,
  DUPLICATE_PAGES_URL,
  DELETE_PAGE_URL,
  UNDELETE_PAGE_URL,
  DELETE_PAGES_WITH_HASH_URL,
  UNDELETE_PAGES_WITH_HASH_URL,
  GET_COMIC_FILES_URL,
  ADD_BLOCKED_PAGE_HASH_URL,
  DELETE_BLOCKED_PAGE_HASH_URL,
  IMPORT_COMIC_FILES_URL,
  RESCAN_COMIC_FILES_URL,
  GET_SCRAPING_CANDIDATES_URL,
  GET_COMIC_METADATA_URL,
  SCRAPE_METADATA_AND_SAVE_URL,
  SAVE_COMIC_DETAILS_URL,
  CLEAR_METADATA_URL
} from 'app/services/url.constants';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  COMIC_1000,
  COMIC_1001,
  COMIC_1002
} from 'app/models/comics/comic.fixtures';
import { ComicFormat } from 'app/models/comics/comic-format';
import {
  DEFAULT_COMIC_FORMAT_1,
  DEFAULT_COMIC_FORMAT_2,
  DEFAULT_COMIC_FORMAT_3
} from 'app/models/comics/comic-format.fixtures';
import { LibraryState } from 'app/models/library-state';
import { Comic } from 'app/models/comics/comic';
import { PageType } from 'app/models/comics/page-type';
import {
  FRONT_COVER,
  STORY,
  BACK_COVER
} from 'app/models/comics/page-type.fixtures';
import { PAGE_1, PAGE_2 } from 'app/models/comics/page.fixtures';
import { request } from 'http';
import { DUPLICATE_PAGE_2 } from 'app/models/comics/duplicate-page.fixtures';
import { ComicFile } from 'app/models/import/comic-file';
import {
  EXISTING_COMIC_FILE_1,
  EXISTING_COMIC_FILE_2,
  EXISTING_COMIC_FILE_3
} from 'app/models/import/comic-file.fixtures';
import { Page } from 'app/models/comics/page';
import { Volume } from 'app/models/comics/volume';
import {
  VOLUME_1000,
  VOLUME_1002,
  VOLUME_1004
} from 'app/models/comics/volume.fixtures';

describe('ComicService', () => {
  const COMICS = [COMIC_1000, COMIC_1002];
  const SCAN_TYPES = [FIRST_SCAN_TYPE, THIRD_SCAN_TYPE, FOURTH_SCAN_TYPE];
  const COMIC_FORMATS = [DEFAULT_COMIC_FORMAT_1, DEFAULT_COMIC_FORMAT_3];
  const API_KEY = '0123456789abcdef';
  const SERIES_NAME = 'Super Awesome Comic Book';
  const VOLUME = '2015';
  const ISSUE_NUMBER = '717';
  const COMIC = COMIC_1000;
  const ISSUE_ID = 49152;

  let service: ComicService;
  let user_service: UserService;
  let http_mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ComicService,
        { provide: UserService, userClass: UserServiceMock }
      ]
    });

    service = TestBed.get(ComicService);
    user_service = TestBed.get(UserService);
    http_mock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetches the scan types from the server', () => {
    service.fetch_scan_types().subscribe((result: Array<ScanType>) => {
      expect(result).toEqual(SCAN_TYPES);
    });

    const req = http_mock.expectOne(COMIC_SCAN_TYPES_URL);
    expect(req.request.method).toEqual('GET');

    req.flush(SCAN_TYPES);
  });

  it('sets the scan type on a comic', () => {
    service.set_scan_type(COMIC_1000, FIRST_SCAN_TYPE).subscribe(result => {
      expect(result).toBeFalsy();
    });

    const req = http_mock.expectOne(
      interpolate(COMIC_SET_SCAN_TYPE_URL, { id: COMIC_1000.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body.get('scan_type_id')).toEqual(
      `${FIRST_SCAN_TYPE.id}`
    );

    req.flush(null, { status: 200, statusText: 'Success' });
  });

  it('fetches the formats from the server', () => {
    service.fetch_formats().subscribe((result: Array<ComicFormat>) => {
      expect(result).toEqual(COMIC_FORMATS);
    });

    const req = http_mock.expectOne(COMIC_FORMAT_TYPES_URL);
    expect(req.request.method).toEqual('GET');

    req.flush(COMIC_FORMATS);
  });

  it('sets the comic format for a comic', () => {
    service.set_format(COMIC_1001, DEFAULT_COMIC_FORMAT_2).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = http_mock.expectOne(
      interpolate(COMIC_SET_FORMAT_TYPE_URL, { id: COMIC_1001.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body.get('format_id')).toEqual(
      `${DEFAULT_COMIC_FORMAT_2.id}`
    );

    req.flush(null, { status: 200, statusText: 'success' });
  });

  it('sets the sort name for a comic', () => {
    const SORT_NAME = 'Sortable name';

    service.set_sort_name(COMIC_1002, SORT_NAME).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = http_mock.expectOne(
      interpolate(COMIC_SET_SORT_NAME_URL, { id: COMIC_1002.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body.get('sort_name')).toEqual(SORT_NAME);

    req.flush(null, { status: 200, statusText: 'success' });
  });

  it('fetches the remote library state', () => {
    const import_count = Math.floor(Math.random() * 10000 + 1);
    const rescan_count = Math.floor(Math.random() * 10000 + 1);
    const latest_comic_update = 0;
    const timeout = 300000;

    service
      .fetch_remote_library_state(`${latest_comic_update}`, timeout)
      .subscribe((library_state: LibraryState) => {
        expect(library_state.comics).toEqual(COMICS);
        expect(library_state.import_count).toEqual(import_count);
        expect(library_state.rescan_count).toEqual(rescan_count);
      });

    const req = http_mock.expectOne(
      interpolate(LIBRARY_STATE_URL, {
        latest: latest_comic_update,
        timeout: timeout
      })
    );
    expect(req.request.method).toEqual('GET');

    req.flush({
      comics: COMICS,
      import_count: import_count,
      rescan_count: rescan_count
    });
  });

  describe('when deleting comics', () => {
    it('handles successful deletion', () => {
      service.delete_comic(COMIC_1000).subscribe((result: boolean) => {
        expect(result).toBeTruthy();
      });

      const req = http_mock.expectOne(
        interpolate(COMIC_DELETE_URL, { id: COMIC_1000.id })
      );
      expect(req.request.method).toEqual('DELETE');

      req.flush(1);
    });

    it('handles failed deletion', () => {
      service.delete_comic(COMIC_1000).subscribe((result: boolean) => {
        expect(result).toBeFalsy();
      });

      const req = http_mock.expectOne(
        interpolate(COMIC_DELETE_URL, { id: COMIC_1000.id })
      );
      expect(req.request.method).toEqual('DELETE');

      req.flush(0);
    });
  });

  it('fetches the comic summary', () => {
    service.get_comic_summary(COMIC_1000.id).subscribe((result: Comic) => {
      expect(result).toEqual(COMIC_1000);
    });

    const req = http_mock.expectOne(
      interpolate(COMIC_SUMMARY_URL, { id: COMIC_1000.id })
    );
    expect(req.request.method).toEqual('GET');

    req.flush(COMIC_1000);
  });

  it('fetches the list of page types', () => {
    const PAGE_TYPES = [FRONT_COVER, STORY, BACK_COVER];
    service.get_page_types().subscribe((result: Array<PageType>) => {
      expect(result).toEqual(PAGE_TYPES);
    });

    const req = http_mock.expectOne(PAGE_TYPES_URL);
    expect(req.request.method).toEqual('GET');

    req.flush(PAGE_TYPES);
  });

  it('sets the page type for a comic', () => {
    service.set_page_type(PAGE_1, BACK_COVER.id).subscribe(result => {
      expect(result).toBeFalsy();
    });

    const req = http_mock.expectOne(
      interpolate(PAGE_TYPE_URL, { id: PAGE_1.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body.get('type_id')).toEqual(`${BACK_COVER.id}`);

    req.flush(null, { status: 200, statusText: 'success' });
  });

  it('downloads the list of duplicate pages', () => {
    const PAGES = [PAGE_1, PAGE_2];
    service.get_duplicate_pages().subscribe((result: Array<Page>) => {
      expect(result).toEqual(PAGES);
    });

    const req = http_mock.expectOne(DUPLICATE_PAGES_URL);
    expect(req.request.method).toEqual('GET');

    req.flush(PAGES);
  });

  it('can mark a page as deleted', () => {
    service.mark_page_as_deleted(PAGE_2).subscribe((result: boolean) => {
      expect(result).toBeTruthy();
    });

    const req = http_mock.expectOne(
      interpolate(DELETE_PAGE_URL, { id: PAGE_2.id })
    );
    expect(req.request.method).toEqual('DELETE');

    req.flush(1);
  });

  it('can unmark a page as deleted', () => {
    service.mark_page_as_undeleted(PAGE_2).subscribe((result: boolean) => {
      expect(result).toBeTruthy();
    });

    const req = http_mock.expectOne(
      interpolate(UNDELETE_PAGE_URL, { id: PAGE_2.id })
    );
    expect(req.request.method).toEqual('POST');

    req.flush(1);
  });

  it('deletes all pages for a hash', () => {
    const HASH = '01234567890abcdef';
    service.delete_all_pages_for_hash(HASH).subscribe((result: number) => {
      expect(result).toEqual(17);
    });

    const req = http_mock.expectOne(
      interpolate(DELETE_PAGES_WITH_HASH_URL, { hash: HASH })
    );
    expect(req.request.method).toEqual('DELETE');

    req.flush(17);
  });

  it('undeletes all pages for a hash', () => {
    const HASH = '01234567890abcdef';
    service.undelete_all_pages_for_hash(HASH).subscribe((result: number) => {
      expect(result).toEqual(23);
    });

    const req = http_mock.expectOne(
      interpolate(UNDELETE_PAGES_WITH_HASH_URL, { hash: HASH })
    );
    expect(req.request.method).toEqual('PUT');

    req.flush(23);
  });

  it('returns the files under a directory', () => {
    const DIRECTORY = '/Users/comixedreader/library/comics';
    const COMIC_FILES = [
      EXISTING_COMIC_FILE_1,
      EXISTING_COMIC_FILE_2,
      EXISTING_COMIC_FILE_3
    ];

    service
      .get_files_under_directory(DIRECTORY)
      .subscribe((result: Array<ComicFile>) => {
        expect(result).toEqual(COMIC_FILES);
      });

    const req = http_mock.expectOne(
      interpolate(GET_COMIC_FILES_URL, { directory: DIRECTORY })
    );
    expect(req.request.method).toEqual('GET');

    req.flush(COMIC_FILES);
  });

  describe('blocking pages', () => {
    it('can block pages', () => {
      service.set_block_page(PAGE_1.hash, true).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = http_mock.expectOne(ADD_BLOCKED_PAGE_HASH_URL);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('hash')).toEqual(PAGE_1.hash);

      req.flush(null, { status: 200, statusText: 'success' });
    });

    it('can unblock pages', () => {
      service.set_block_page(PAGE_1.hash, false).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = http_mock.expectOne(
        interpolate(DELETE_BLOCKED_PAGE_HASH_URL, { hash: PAGE_1.hash })
      );
      expect(req.request.method).toEqual('DELETE');

      req.flush(null, { status: 200, statusText: 'success' });
    });
  });

  describe('when importing files', () => {
    it('imports the files', () => {
      const FILENAMES = [
        EXISTING_COMIC_FILE_1.filename,
        EXISTING_COMIC_FILE_3.filename
      ];
      const ENCODED = [
        encodeURIComponent(EXISTING_COMIC_FILE_1.filename),
        encodeURIComponent(EXISTING_COMIC_FILE_3.filename)
      ];
      service
        .import_files_into_library(FILENAMES, false, false)
        .subscribe(response => {
          expect(response).toBeNull();
        });

      const req = http_mock.expectOne(IMPORT_COMIC_FILES_URL);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('filenames')).toEqual(ENCODED.toString());
      expect(req.request.body.get('delete_blocked_pages')).toEqual('false');
      expect(req.request.body.get('ignore_metadata')).toEqual('false');
      req.flush(null, { status: 200, statusText: 'success' });
    });

    it('can delete blocked pages', () => {
      const FILENAMES = [
        EXISTING_COMIC_FILE_1.filename,
        EXISTING_COMIC_FILE_3.filename
      ];
      const ENCODED = [
        encodeURIComponent(EXISTING_COMIC_FILE_1.filename),
        encodeURIComponent(EXISTING_COMIC_FILE_3.filename)
      ];
      service
        .import_files_into_library(FILENAMES, true, false)
        .subscribe(response => {
          expect(response).toBeNull();
        });

      const req = http_mock.expectOne(IMPORT_COMIC_FILES_URL);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('filenames')).toEqual(ENCODED.toString());
      expect(req.request.body.get('delete_blocked_pages')).toEqual('true');
      expect(req.request.body.get('ignore_metadata')).toEqual('false');
      req.flush(null, { status: 200, statusText: 'success' });
    });

    it('can ignore the metadata inside the comics', () => {
      const FILENAMES = [
        EXISTING_COMIC_FILE_1.filename,
        EXISTING_COMIC_FILE_3.filename
      ];
      const ENCODED = [
        encodeURIComponent(EXISTING_COMIC_FILE_1.filename),
        encodeURIComponent(EXISTING_COMIC_FILE_3.filename)
      ];
      service
        .import_files_into_library(FILENAMES, false, true)
        .subscribe(response => {
          expect(response).toBeNull();
        });

      const req = http_mock.expectOne(IMPORT_COMIC_FILES_URL);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('filenames')).toEqual(ENCODED.toString());
      expect(req.request.body.get('delete_blocked_pages')).toEqual('false');
      expect(req.request.body.get('ignore_metadata')).toEqual('true');
      req.flush(null, { status: 200, statusText: 'success' });
    });
  });

  describe('when requesting a library rescan', () => {
    it('sends a request', () => {
      service.rescan_files().subscribe(result => {
        expect(result).toBeFalsy();
      });

      const req = http_mock.expectOne(RESCAN_COMIC_FILES_URL);
      expect(req.request.method).toEqual('POST');

      req.flush(null, { status: 200, statusText: 'success' });
    });
  });

  describe('when fetching comic candidates', () => {
    const VOLUMES = [VOLUME_1000, VOLUME_1002, VOLUME_1004];

    it('sends a request', () => {
      service
        .fetch_candidates_for(API_KEY, SERIES_NAME, VOLUME, ISSUE_NUMBER, true)
        .subscribe((result: Array<Volume>) => {
          expect(result).toEqual(VOLUMES);
        });

      const req = http_mock.expectOne(GET_SCRAPING_CANDIDATES_URL);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('api_key')).toEqual(API_KEY);
      expect(req.request.body.get('series_name')).toEqual(SERIES_NAME);
      expect(req.request.body.get('volume')).toEqual(VOLUME);
      expect(req.request.body.get('issue_number')).toEqual(ISSUE_NUMBER);
      expect(req.request.body.get('skip_cache')).toEqual('true');
      req.flush(VOLUMES);
    });
  });

  describe('when scraping metadata for a single comic', () => {
    it('posts the details for the comic', () => {
      service
        .scrape_comic_details_for(API_KEY, VOLUME, ISSUE_NUMBER, true)
        .subscribe((result: Comic) => {
          expect(result).toEqual(COMIC);
        });

      const req = http_mock.expectOne(GET_COMIC_METADATA_URL);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('api_key')).toEqual(API_KEY);
      expect(req.request.body.get('volume')).toEqual(VOLUME);
      expect(req.request.body.get('issue_number')).toEqual(ISSUE_NUMBER);
      expect(req.request.body.get('skip_cache')).toEqual('true');
      req.flush(COMIC);
    });
  });

  describe('when scraping and saving a single comic', () => {
    it('posts the details to the server', () => {
      service
        .scrape_and_save_comic_details(API_KEY, COMIC.id, ISSUE_ID, true)
        .subscribe((result: Comic) => {
          expect(result).toEqual(COMIC);
        });

      const req = http_mock.expectOne(SCRAPE_METADATA_AND_SAVE_URL);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('api_key')).toEqual(API_KEY);
      expect(req.request.body.get('comic_id')).toEqual(`${COMIC.id}`);
      expect(req.request.body.get('issue_id')).toEqual(`${ISSUE_ID}`);
      expect(req.request.body.get('skip_cache')).toEqual('true');

      req.flush(COMIC);
    });
  });

  describe('when saving the detail changes for a comic', () => {
    it('posts the details to the server', () => {
      service
        .save_changes_to_comic(COMIC, SERIES_NAME, VOLUME, ISSUE_NUMBER)
        .subscribe((result: Comic) => {
          expect(result).not.toBeNull();
          expect(result.series).toEqual(SERIES_NAME);
          expect(result.volume).toEqual(VOLUME);
          expect(result.issue_number).toEqual(ISSUE_NUMBER);
        });

      const req = http_mock.expectOne(
        interpolate(SAVE_COMIC_DETAILS_URL, { id: COMIC.id })
      );
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body.get('series')).toEqual(SERIES_NAME);
      expect(req.request.body.get('volume')).toEqual(VOLUME);
      expect(req.request.body.get('issue_number')).toEqual(ISSUE_NUMBER);
      req.flush({
        ...COMIC,
        series: SERIES_NAME,
        volume: VOLUME,
        issue_number: ISSUE_NUMBER
      });
    });
  });

  describe('when clearing the metadata for a comic', () => {
    it('sends a request to the server', () => {
      service.clear_metadata(COMIC).subscribe((result: Comic) => {
        expect(result).toEqual(COMIC);
      });

      const req = http_mock.expectOne(
        interpolate(CLEAR_METADATA_URL, { id: COMIC.id })
      );
      expect(req.request.method).toEqual('DELETE');
      req.flush(COMIC);
    });
  });
});
