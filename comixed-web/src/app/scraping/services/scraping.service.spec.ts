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
import { ScrapingService } from './scraping.service';
import {
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/scraping/scraping.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';
import { interpolate } from '@app/core';
import {
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  SCRAPE_COMIC_URL
} from '@app/scraping/scraping.constants';
import { LoadScrapingIssueRequest } from '@app/scraping/models/net/load-scraping-issue-request';
import { ScrapeComicRequest } from '@app/scraping/models/net/scrape-comic-request';
import { COMIC_4 } from '@app/comic/comic.fixtures';

describe('ScrapingService', () => {
  const API_KEY = '1234567890ABCDEF';
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const COMIC = COMIC_4;

  let service: ScrapingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ScrapingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load scraping volumes', () => {
    service
      .loadScrapingVolumes({
        apiKey: API_KEY,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(VOLUMES));

    const req = httpMock.expectOne(interpolate(LOAD_SCRAPING_VOLUMES_URL));
  });

  it('can load a scraping issue', () => {
    service
      .loadScrapingIssue({
        apiKey: API_KEY,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(SCRAPING_ISSUE));

    const req = httpMock.expectOne(
      interpolate(LOAD_SCRAPING_ISSUE_URL, {
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      apiKey: API_KEY,
      skipCache: SKIP_CACHE
    } as LoadScrapingIssueRequest);
    req.flush(SCRAPING_ISSUE);
  });

  it('can scrape a comic', () => {
    service
      .scrapeComic({
        apiKey: API_KEY,
        issueId: SCRAPING_ISSUE.id,
        comic: COMIC,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(SCRAPE_COMIC_URL, { comicId: COMIC.id })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      apiKey: API_KEY,
      issueId: SCRAPING_ISSUE.id,
      skipCache: SKIP_CACHE
    } as ScrapeComicRequest);
    req.flush(COMIC);
  });
});
