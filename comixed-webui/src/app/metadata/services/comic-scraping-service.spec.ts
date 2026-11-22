/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { ComicScrapingService } from './comic-scraping-service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2
} from '@app/metadata/metadata-fixtures';
import {
  LOAD_MULTI_COMIC_SCRAPING_ENTRIES_URL,
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  REMOVE_MULTI_COMIC_ENTRY_URL,
  SCRAPE_FILENAME_URL,
  SCRAPE_MULTI_COMIC_ENTRY_URL,
  SCRAPE_SINGLE_COMIC_URL,
  START_MULTI_COMIC_SCRAPING_URL
} from '@app/metadata/metadata-constants';
import { interpolate } from '@app/app-functions';
import { LoadScrapingVolumesRequest } from '@app/metadata/models/net/load-scraping-volumes-request';
import { LoadScrapingIssueRequest } from '@app/metadata/models/net/load-scraping-issue-request';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';
import { ScrapeSingleIssueRequest } from '@app/metadata/models/net/scrape-single-issue-request';
import { ScrapeFilenameResponse } from '@app/metadata/models/net/scrape-filename-response';
import { ScrapeFilenameRequest } from '@app/metadata/models/net/scrape-filename-request';
import { StartMultiComicScrapingResponse } from '@app/metadata/models/net/start-multi-comic-scraping-response';
import { StartMultiComicScrapingRequest } from '@app/metadata/models/net/start-multi-comic-scraping-request';
import { LoadMultiComicScrapingRequest } from '@app/metadata/models/net/load-multi-comic-scraping-request';
import { LoadMultiComicScrapingResponse } from '@app/metadata/models/net/load-multi-comic-scraping-response';
import { RemoveMultiComicScrapingResponse } from '@app/metadata/models/net/remove-multi-comic-scraping-response';
import { ScrapeMultiComicEntryResponse } from '@app/metadata/models/net/scrape-multi-comic-entry-response';
import { ScrapeMultiComicEntryRequest } from '@app/metadata/models/net/scrape-multi-comic-entry-request';

describe('ComicScrapingService', () => {
  const TEST_PUBLISHER = 'The Publisher';
  const TEST_SERIES = 'The Series';
  const TEST_MATCH_PUBLISHER = Math.random() > 0.5;
  const TEST_SKIP_CACHE = Math.random() > 0.5;
  const TEST_MAX_RECORDS = 0;
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_SCRAPING_VOLUME_LIST = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2];
  const TEST_SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const TEST_VOLUME_ID = '9000';
  const TEST_ISSUE_NUMBER = '717';
  const TEST_ISSUE_ID = TEST_SCRAPING_ISSUE.id;
  const TEST_COMIC = COMIC_1;
  const TEST_VOLUME = '2026';
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const TEST_INDEX = 3;
  const TEST_SIZE = 10;
  const TEST_TOTAL = 129;

  let service: ComicScrapingService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(ComicScrapingService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load scraping volumes', () => {
    const serverResponse = TEST_SCRAPING_VOLUME_LIST;

    service
      .loadVolumes({
        metadataSource: TEST_METADATA_SOURCE,
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        matchPublisher: TEST_MATCH_PUBLISHER,
        skipCache: TEST_SKIP_CACHE,
        maxRecords: TEST_MAX_RECORDS
      })
      .subscribe(response =>
        expect(response).toStrictEqual(TEST_SCRAPING_VOLUME_LIST)
      );

    const req = httpController.expectOne(
      interpolate(LOAD_SCRAPING_VOLUMES_URL, {
        metadataSourceId: TEST_METADATA_SOURCE.metadataSourceId
      })
    );
    expect(req.request.method).toStrictEqual('POST');
    expect(req.request.body).toStrictEqual({
      publisher: TEST_PUBLISHER,
      series: TEST_SERIES,
      matchPublisher: TEST_MATCH_PUBLISHER,
      skipCache: TEST_SKIP_CACHE,
      maxRecords: TEST_MAX_RECORDS
    } as LoadScrapingVolumesRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should load a scraping issue', () => {
    const serverResponse = TEST_SCRAPING_ISSUE;

    service
      .loadIssue({
        metadataSource: TEST_METADATA_SOURCE,
        volumeId: TEST_VOLUME_ID,
        issueNumber: TEST_ISSUE_NUMBER,
        skipCache: TEST_SKIP_CACHE
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(TEST_SCRAPING_ISSUE)
      });

    const req = httpController.expectOne(
      interpolate(LOAD_SCRAPING_ISSUE_URL, {
        metadataSourceId: TEST_METADATA_SOURCE.metadataSourceId,
        volumeId: TEST_VOLUME_ID,
        issueNumber: TEST_ISSUE_NUMBER
      })
    );
    expect(req.request.method).toStrictEqual('POST');
    expect(req.request.body).toStrictEqual({
      skipCache: TEST_SKIP_CACHE
    } as LoadScrapingIssueRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should scrape a comic', () => {
    service
      .scrapeIssue({
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_ISSUE_ID,
        comic: TEST_COMIC,
        skipCache: TEST_SKIP_CACHE
      })
      .subscribe({
        next: () => expect(true).toBeTruthy()
      });

    const req = httpController.expectOne(
      interpolate(SCRAPE_SINGLE_COMIC_URL, {
        metadataSourceId: TEST_METADATA_SOURCE.metadataSourceId,
        comicId: TEST_COMIC.comicId
      })
    );
    expect(req.request.method).toStrictEqual('PUT');
    expect(req.request.body).toStrictEqual({
      issueId: TEST_ISSUE_ID,
      skipCache: TEST_SKIP_CACHE,
      pageSize: 10,
      pageNumber: 0
    } as ScrapeSingleIssueRequest);
    req.flush(null);
    httpController.verify();
  });

  it('should scrape a comic filename', () => {
    const serverResponse = {
      series: TEST_SERIES,
      volume: TEST_VOLUME,
      issueNumber: TEST_ISSUE_NUMBER,
      found: true
    } as ScrapeFilenameResponse;

    service
      .scrapeFilename({
        comic: TEST_COMIC
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(interpolate(SCRAPE_FILENAME_URL));
    expect(req.request.method).toStrictEqual('POST');
    expect(req.request.body).toStrictEqual({
      filename: TEST_COMIC.filename
    } as ScrapeFilenameRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should start multi-comic scraping', () => {
    const serverResponse = {
      comics: TEST_COMIC_LIST,
      pageNumber: TEST_INDEX,
      pageSize: TEST_SIZE,
      totalComics: TEST_TOTAL
    } as StartMultiComicScrapingResponse;

    service
      .startMultiComicScraping({
        index: TEST_INDEX,
        size: TEST_SIZE
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(START_MULTI_COMIC_SCRAPING_URL)
    );
    expect(req.request.method).toStrictEqual('PUT');
    expect(req.request.body).toStrictEqual({
      pageNumber: TEST_INDEX,
      pageSize: TEST_SIZE
    } as StartMultiComicScrapingRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should load multi-comic scraping entries', () => {
    const serverResponse = {
      comics: TEST_COMIC_LIST,
      pageNumber: TEST_INDEX,
      pageSize: TEST_SIZE,
      totalComics: TEST_TOTAL
    } as LoadMultiComicScrapingResponse;

    service
      .loadMultiComicScraping({
        index: TEST_INDEX,
        size: TEST_SIZE
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(LOAD_MULTI_COMIC_SCRAPING_ENTRIES_URL)
    );
    expect(req.request.method).toStrictEqual('POST');
    expect(req.request.body).toStrictEqual({
      pageNumber: TEST_INDEX,
      pageSize: TEST_SIZE
    } as LoadMultiComicScrapingRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should remove entries from multi-comic scraping', () => {
    const serverResponse = {
      comics: TEST_COMIC_LIST,
      pageNumber: TEST_INDEX,
      pageSize: TEST_SIZE,
      totalComics: TEST_TOTAL
    } as RemoveMultiComicScrapingResponse;

    service
      .removeMultiComicScraping({
        comic: TEST_COMIC,
        size: TEST_SIZE
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(REMOVE_MULTI_COMIC_ENTRY_URL, {
        comicId: TEST_COMIC.comicId,
        size: TEST_SIZE
      })
    );
    expect(req.request.method).toStrictEqual('DELETE');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should scrape a multi-comic entry', () => {
    const serverResponse = {
      comics: TEST_COMIC_LIST,
      pageNumber: TEST_INDEX,
      pageSize: TEST_SIZE,
      totalComics: TEST_TOTAL
    } as ScrapeMultiComicEntryResponse;

    service
      .scrapeMultiComicEntry({
        metadataSource: TEST_METADATA_SOURCE,
        issueId: TEST_ISSUE_ID,
        comic: TEST_COMIC,
        skipCache: TEST_SKIP_CACHE,
        index: TEST_INDEX,
        size: TEST_SIZE
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(SCRAPE_MULTI_COMIC_ENTRY_URL, {
        metadataSourceId: TEST_METADATA_SOURCE.metadataSourceId,
        comicId: TEST_COMIC.comicId
      })
    );
    expect(req.request.method).toStrictEqual('POST');
    expect(req.request.body).toEqual({
      issueId: TEST_ISSUE_ID,
      skipCache: TEST_SKIP_CACHE,
      pageNumber: TEST_INDEX,
      pageSize: TEST_SIZE
    } as ScrapeMultiComicEntryRequest);
    req.flush(serverResponse);
    httpController.verify();
  });
});
