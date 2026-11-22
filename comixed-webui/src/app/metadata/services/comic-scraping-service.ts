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
  LOAD_MULTI_COMIC_SCRAPING_ENTRIES_URL,
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  REMOVE_MULTI_COMIC_ENTRY_URL,
  SCRAPE_FILENAME_URL,
  SCRAPE_MULTI_COMIC_ENTRY_URL,
  SCRAPE_SINGLE_COMIC_URL,
  START_MULTI_COMIC_SCRAPING_URL
} from '@app/metadata/metadata-constants';
import { LoadScrapingVolumesRequest } from '@app/metadata/models/net/load-scraping-volumes-request';
import { ScrapingIssue } from '@app/metadata/models/scraping-issue';
import { LoadScrapingIssueRequest } from '@app/metadata/models/net/load-scraping-issue-request';
import { Comic } from '@app/library/models/comic';
import { ScrapeSingleIssueRequest } from '@app/metadata/models/net/scrape-single-issue-request';
import { ScrapeFilenameResponse } from '@app/metadata/models/net/scrape-filename-response';
import { ScrapeFilenameRequest } from '@app/metadata/models/net/scrape-filename-request';
import { StartMultiComicScrapingResponse } from '@app/metadata/models/net/start-multi-comic-scraping-response';
import { StartMultiComicScrapingRequest } from '@app/metadata/models/net/start-multi-comic-scraping-request';
import { LoadMultiComicScrapingResponse } from '@app/metadata/models/net/load-multi-comic-scraping-response';
import { LoadMultiComicScrapingRequest } from '@app/metadata/models/net/load-multi-comic-scraping-request';
import { RemoveMultiComicScrapingResponse } from '@app/metadata/models/net/remove-multi-comic-scraping-response';
import { ScrapeMultiComicEntryResponse } from '@app/metadata/models/net/scrape-multi-comic-entry-response';
import { ScrapeMultiComicEntryRequest } from '@app/metadata/models/net/scrape-multi-comic-entry-request';

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
      interpolate(SCRAPE_SINGLE_COMIC_URL, {
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

  scrapeFilename(args: { comic: Comic }): Observable<ScrapeFilenameResponse> {
    this.logger.debug('Scraping comic filename:', args);
    return this.http.post<ScrapeFilenameResponse>(
      interpolate(SCRAPE_FILENAME_URL),
      {
        filename: args.comic.filename
      } as ScrapeFilenameRequest
    );
  }

  startMultiComicScraping(args: {
    index: number;
    size: number;
  }): Observable<StartMultiComicScrapingResponse> {
    this.logger.debug('Starting multi-comic scraping:', args);
    return this.http.put<StartMultiComicScrapingResponse>(
      interpolate(START_MULTI_COMIC_SCRAPING_URL),
      {
        pageNumber: args.index,
        pageSize: args.size
      } as StartMultiComicScrapingRequest
    );
  }

  loadMultiComicScraping(args: {
    index: number;
    size: number;
  }): Observable<LoadMultiComicScrapingResponse> {
    this.logger.debug('Loading multi-comic scraping entries:', args);
    return this.http.post<LoadMultiComicScrapingResponse>(
      interpolate(LOAD_MULTI_COMIC_SCRAPING_ENTRIES_URL),
      {
        pageNumber: args.index,
        pageSize: args.size
      } as LoadMultiComicScrapingRequest
    );
  }

  removeMultiComicScraping(args: {
    comic: Comic;
    size: number;
  }): Observable<RemoveMultiComicScrapingResponse> {
    this.logger.debug('Removing comic from multi-comic scraping:', args);
    return this.http.delete<RemoveMultiComicScrapingResponse>(
      interpolate(REMOVE_MULTI_COMIC_ENTRY_URL, {
        comicId: args.comic.comicId,
        size: args.size
      })
    );
  }

  scrapeMultiComicEntry(args: {
    comic: Comic;
    index: number;
    issueId: string;
    metadataSource: MetadataSource;
    size: number;
    skipCache: boolean;
  }): Observable<ScrapeMultiComicEntryResponse> {
    this.logger.debug('Scraping comic from multi-comic session:', args);
    return this.http.post<ScrapeMultiComicEntryResponse>(
      interpolate(SCRAPE_MULTI_COMIC_ENTRY_URL, {
        metadataSourceId: args.metadataSource.metadataSourceId,
        comicId: args.comic.comicId
      }),
      {
        issueId: args.issueId,
        skipCache: args.skipCache,
        pageNumber: args.index,
        pageSize: args.size
      } as ScrapeMultiComicEntryRequest
    );
  }
}
