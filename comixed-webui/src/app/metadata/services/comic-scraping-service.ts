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

import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ScrapingVolume } from '@app/metadata/models/scraping-volume';
import { MetadataSource } from '@app/metadata/models/metadata-source';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/app-functions';
import {
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  SCRAPE_SINGLE_BOOK_COMIC_URL
} from '@app/metadata/metadata-constants';
import { LoadScrapingVolumesRequest } from '@app/metadata/models/net/load-scraping-volumes-request';
import { ScrapingIssue } from '@app/metadata/models/scraping-issue';
import { LoadScrapingIssueRequest } from '@app/metadata/models/net/load-scraping-issue-request';
import { Comic } from '@app/library/models/comic';
import { ScrapeSingleIssueRequest } from '@app/metadata/models/net/scrape-single-issue-request';

@Service()
export class ComicScrapingService {
  readonly logger = inject(LoggerService);
  readonly http = inject(HttpClient);

  loadVolumes(args: {
    metadataSource: MetadataSource;
    publisher: string;
    series: string;
    maxRecords: number;
    skipCache: boolean;
    matchPublisher: boolean;
  }): Observable<ScrapingVolume[]> {
    this.logger.debug('Loading scraping volumes:', args);
    return this.http.post<ScrapingVolume[]>(
      interpolate(LOAD_SCRAPING_VOLUMES_URL, {
        metadataSourceId: args.metadataSource.metadataSourceId
      }),
      {
        publisher: args.publisher,
        series: args.series,
        matchPublisher: args.matchPublisher,
        maxRecords: args.maxRecords,
        skipCache: args.skipCache
      } as LoadScrapingVolumesRequest
    );
  }

  loadIssue(args: {
    metadataSource: MetadataSource;
    volumeId: string;
    issueNumber: string;
    skipCache: boolean;
  }): Observable<ScrapingIssue | null> {
    this.logger.debug('Loading scraping issue:', args);
    return this.http.post<ScrapingIssue | null>(
      interpolate(LOAD_SCRAPING_ISSUE_URL, {
        metadataSourceId: args.metadataSource.metadataSourceId,
        volumeId: args.volumeId,
        issueNumber: args.issueNumber
      }),
      {
        skipCache: args.skipCache
      } as LoadScrapingIssueRequest
    );
  }

  scrapeIssue(args: {
    metadataSource: MetadataSource;
    issueId: string;
    comic: Comic;
    skipCache: boolean;
  }): Observable<void> {
    this.logger.debug('Scraping comic:', args);
    return this.http.put<void>(
      interpolate(SCRAPE_SINGLE_BOOK_COMIC_URL, {
        metadataSourceId: args.metadataSource.metadataSourceId,
        comicId: args.comic.comicId
      }),
      {
        issueId: args.issueId,
        skipCache: args.skipCache,
        pageNumber: 0,
        pageSize: 10
      } as ScrapeSingleIssueRequest
    );
  }
}
