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
import {
  GET_ISSUE_URL,
  GET_VOLUMES_URL,
  LOAD_METADATA_URL
} from 'app/comics/comics.constants';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import { GetScrapingIssueRequest } from 'app/comics/models/net/get-scraping-issue-request';
import { GetVolumesRequest } from 'app/comics/models/net/get-volumes-request';
import { LoadMetadataRequest } from 'app/comics/models/net/load-metadata-request';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';
import {
  SCRAPING_VOLUME_1001,
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003,
  SCRAPING_VOLUME_1004,
  SCRAPING_VOLUME_1005
} from 'app/comics/models/scraping-volume.fixtures';
import { LoggerModule } from '@angular-ru/logger';

import { ScrapingService } from './scraping.service';

describe('ScrapingService', () => {
  const API_KEY = 'A0B1C2D3E4F56789';
  const SERIES = 'Awesome Comic Series';
  const VOLUME = '2019';
  const MAX_RECORDS = 14;
  const SKIP_CACHE = true;
  const VOLUMES = [
    SCRAPING_VOLUME_1001,
    SCRAPING_VOLUME_1002,
    SCRAPING_VOLUME_1003,
    SCRAPING_VOLUME_1004,
    SCRAPING_VOLUME_1005
  ];
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1003;
  const ISSUE = SCRAPING_ISSUE_1000;
  const COMIC = COMIC_1;

  let service: ScrapingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [ScrapingService]
    });

    service = TestBed.get(ScrapingService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get a list of volumes for a series', () => {
    service
      .getVolumes(API_KEY, SERIES, VOLUME, MAX_RECORDS, SKIP_CACHE)
      .subscribe(response => expect(response).toEqual(VOLUMES));

    const req = httpMock.expectOne(interpolate(GET_VOLUMES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      apiKey: API_KEY,
      series: SERIES,
      volume: VOLUME,
      maxRecords: MAX_RECORDS,
      skipCache: SKIP_CACHE
    } as GetVolumesRequest);
    req.flush(VOLUMES);
  });

  it('can get a single issue', () => {
    service
      .getIssue(API_KEY, SCRAPING_VOLUME.id, ISSUE.issueNumber, SKIP_CACHE)
      .subscribe(response => expect(response).toEqual(ISSUE));

    const req = httpMock.expectOne(
      interpolate(GET_ISSUE_URL, {
        volume: SCRAPING_VOLUME.id
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      apiKey: API_KEY,
      skipCache: SKIP_CACHE,
      issueNumber: ISSUE.issueNumber
    } as GetScrapingIssueRequest);
    req.flush(ISSUE);
  });

  it('can load metadata for a comic', () => {
    service
      .loadMetadata(API_KEY, COMIC.id, ISSUE.issueNumber, SKIP_CACHE)
      .subscribe(response => expect(response).toEqual(COMIC));

    const req = httpMock.expectOne(
      interpolate(LOAD_METADATA_URL, {
        comicId: COMIC.id,
        issueId: ISSUE.issueNumber
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      apiKey: API_KEY,
      skipCache: SKIP_CACHE
    } as LoadMetadataRequest);
    req.flush(COMIC);
  });
});
