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
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  SCRAPE_SINGLE_BOOK_COMIC_URL
} from '@app/metadata/metadata-constants';
import { interpolate } from '@app/app-functions';
import { LoadScrapingVolumesRequest } from '@app/metadata/models/net/load-scraping-volumes-request';
import { LoadScrapingIssueRequest } from '@app/metadata/models/net/load-scraping-issue-request';
import { COMIC_1 } from '@app/library/library-fixtures';
import { ScrapeSingleIssueRequest } from '@app/metadata/models/net/scrape-single-issue-request';
import { of } from 'rxjs';

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
      interpolate(SCRAPE_SINGLE_BOOK_COMIC_URL, {
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
    req.flush(of(undefined));
    httpController.verify();
  });
});
