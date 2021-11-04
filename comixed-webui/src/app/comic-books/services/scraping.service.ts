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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  SCRAPE_COMIC_URL
} from '@app/library/library.constants';
import { LoadScrapingVolumesRequest } from '@app/comic-books/models/net/load-scraping-volumes-request';
import { LoadScrapingIssueRequest } from '@app/comic-books/models/net/load-scraping-issue-request';
import { Comic } from '@app/comic-books/models/comic';
import { ScrapeComicRequest } from '@app/comic-books/models/net/scrape-comic-request';

/**
 * Interacts with the REST APIs during scraping.
 */
@Injectable({
  providedIn: 'root'
})
export class ScrapingService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Retrieves volumes that match the series name being scraped.
   *
   * @param args.apiKey the API key to use
   * @param args.series the series name
   * @param args.maximumRecords the maximum records to return
   * @param args.skipCache the skip cache flag
   */
  loadScrapingVolumes(args: {
    apiKey: string;
    series: string;
    maximumRecords: number;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.trace('Service: loading scraping volumes:', args);
    return this.http.post(interpolate(LOAD_SCRAPING_VOLUMES_URL), {
      apiKey: args.apiKey,
      series: args.series,
      maxRecords: args.maximumRecords,
      skipCache: args.skipCache
    } as LoadScrapingVolumesRequest);
  }

  /**
   * Load a single scraping issue based on the provided details.
   *
   * @param args.apiKey the API key
   * @param args.volumeId the volume id for the scraping issue
   * @param args.issueNumber the issue number for the comic
   * @param args.skipCache the skip cache flag
   */
  loadScrapingIssue(args: {
    apiKey: string;
    volumeId: number;
    issueNumber: string;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.trace('Service: loading scraping issue:', args);
    return this.http.post(
      interpolate(LOAD_SCRAPING_ISSUE_URL, {
        volumeId: args.volumeId,
        issueNumber: args.issueNumber
      }),
      {
        apiKey: args.apiKey,
        skipCache: args.skipCache
      } as LoadScrapingIssueRequest
    );
  }

  /**
   * Scrape a single comic using the specified issue as the source.
   *
   * @param args.apiKey the API key
   * @param args.issueId the source issue id
   * @param args.comic the comic to be updated
   * @param args.skipCache the skip cache flag
   */
  scrapeComic(args: {
    apiKey: string;
    issueId: number;
    comic: Comic;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.trace('Service: scrape comic:', args);
    return this.http.post(
      interpolate(SCRAPE_COMIC_URL, { comicId: args.comic.id }),
      {
        apiKey: args.apiKey,
        issueId: args.issueId,
        skipCache: args.skipCache
      } as ScrapeComicRequest
    );
  }
}
