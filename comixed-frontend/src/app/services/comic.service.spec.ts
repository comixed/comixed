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

import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { UserServiceMock } from './user.service.mock';
import { ComicService } from './comic.service';
import {
  ADD_BLOCKED_PAGE_HASH_URL,
  CLEAR_METADATA_URL,
  COMIC_DELETE_URL,
  COMIC_SCAN_TYPES_URL,
  COMIC_SET_FORMAT_TYPE_URL,
  COMIC_SET_SCAN_TYPE_URL,
  COMIC_SET_SORT_NAME_URL,
  COMIC_SUMMARY_URL,
  DELETE_BLOCKED_PAGE_HASH_URL,
  DELETE_PAGE_URL,
  DELETE_PAGES_WITH_HASH_URL,
  DUPLICATE_PAGES_URL,
  FORMAT_TYPES_URL,
  GET_COMIC_FILES_URL,
  GET_COMIC_METADATA_URL,
  GET_SCRAPING_CANDIDATES_URL,
  IMPORT_COMIC_FILES_URL,
  LIBRARY_STATE_URL,
  PAGE_TYPE_URL,
  PAGE_TYPES_URL,
  RESCAN_COMIC_FILES_URL,
  SAVE_COMIC_DETAILS_URL,
  SCRAPE_METADATA_AND_SAVE_URL,
  UNDELETE_PAGE_URL,
  UNDELETE_PAGES_WITH_HASH_URL
} from 'app/services/url.constants';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  Comic,
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  ComicFile,
  ComicFormat,
  FORMAT_1,
  FORMAT_2,
  FORMAT_3,
  ScanType
} from 'app/library';
import { PageType } from 'app/models/comics/page-type';
import {
  BACK_COVER,
  FRONT_COVER,
  STORY
} from 'app/models/comics/page-type.fixtures';
import { PAGE_1, PAGE_2 } from 'app/models/comics/page.fixtures';
import { Page } from 'app/models/comics/page';
import { Volume } from 'app/models/comics/volume';
import {
  VOLUME_1000,
  VOLUME_1002,
  VOLUME_1004
} from 'app/models/comics/volume.fixtures';
import { interpolate } from 'app/app.functions';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3
} from 'app/library/models/scan-type.fixtures';

describe('ComicService', () => {
  const COMICS = [COMIC_2, COMIC_3];
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_2];
  const COMIC_FORMATS = [FORMAT_1, FORMAT_3];
  const API_KEY = '0123456789abcdef';
  const SERIES_NAME = 'Super Awesome Comic Book';
  const VOLUME = '2015';
  const ISSUE_NUMBER = '717';
  const COMIC = COMIC_1;
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
});
