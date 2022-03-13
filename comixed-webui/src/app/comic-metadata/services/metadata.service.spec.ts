/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { MetadataService } from './metadata.service';
import { COMIC_4 } from '@app/comic-books/comic-books.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  CLEAR_METADATA_AUDIT_LOG_URL,
  LOAD_METADATA_AUDIT_LOG_URL,
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  SCRAPE_COMIC_URL
} from '@app/library/library.constants';
import { LoadIssueMetadataRequest } from '@app/comic-metadata/models/net/load-issue-metadata-request';
import { ScrapeComicRequest } from '@app/comic-metadata/models/net/scrape-comic-request';
import {
  METADATA_AUDIT_LOG_ENTRY_1,
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-metadata/comic-metadata.fixtures';
import { HttpRequest, HttpResponse } from '@angular/common/http';

describe('MetadataService', () => {
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const COMIC = COMIC_4;
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const ENTRIES = [METADATA_AUDIT_LOG_ENTRY_1];

  let service: MetadataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(MetadataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load scraping volumes', () => {
    service
      .loadScrapingVolumes({
        metadataSource: METADATA_SOURCE,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(VOLUMES));

    const req = httpMock.expectOne(
      interpolate(LOAD_SCRAPING_VOLUMES_URL, { sourceId: METADATA_SOURCE.id })
    );
  });

  it('can load a scraping issue', () => {
    service
      .loadScrapingIssue({
        metadataSource: METADATA_SOURCE,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(SCRAPING_ISSUE));

    const req = httpMock.expectOne(
      interpolate(LOAD_SCRAPING_ISSUE_URL, {
        sourceId: METADATA_SOURCE.id,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      skipCache: SKIP_CACHE
    } as LoadIssueMetadataRequest);
    req.flush(SCRAPING_ISSUE);
  });

  it('can scrape a comic', () => {
    service
      .scrapeComic({
        metadataSource: METADATA_SOURCE,
        issueId: SCRAPING_ISSUE.id,
        comic: COMIC,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(SCRAPE_COMIC_URL, {
        sourceId: METADATA_SOURCE.id,
        comicId: COMIC.id
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      issueId: SCRAPING_ISSUE.id,
      skipCache: SKIP_CACHE
    } as ScrapeComicRequest);
    req.flush(COMIC);
  });

  it('can load the audit log', () => {
    service
      .loadAuditLog()
      .subscribe(response => expect(response).toEqual(ENTRIES));

    const req = httpMock.expectOne(interpolate(LOAD_METADATA_AUDIT_LOG_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(ENTRIES);
  });

  it('can clear the audit log', () => {
    service
      .clearAuditLog()
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(CLEAR_METADATA_AUDIT_LOG_URL));
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });
});
