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
  CLEAR_METADATA_AUDIT_LOG_URL,
  LOAD_METADATA_AUDIT_LOG_URL,
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  SCRAPE_COMIC_URL
} from '@app/library/library.constants';
import { LoadVolumeMetadataRequest } from '@app/comic-metadata/models/net/load-volume-metadata-request';
import { LoadIssueMetadataRequest } from '@app/comic-metadata/models/net/load-issue-metadata-request';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ScrapeComicRequest } from '@app/comic-metadata/models/net/scrape-comic-request';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

/**
 * Interacts with the REST APIs during scraping.
 */
@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Retrieves volumes that match the series name being scraped.
   *
   * @param args.metadataSource the metadata source
   * @param args.series the series name
   * @param args.maximumRecords the maximum records to return
   * @param args.skipCache the skip cache flag
   */
  loadScrapingVolumes(args: {
    metadataSource: MetadataSource;
    series: string;
    maximumRecords: number;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.trace('Loading scraping volumes:', args);
    return this.http.post(
      interpolate(LOAD_SCRAPING_VOLUMES_URL, {
        sourceId: args.metadataSource.id
      }),
      {
        series: args.series,
        maxRecords: args.maximumRecords,
        skipCache: args.skipCache
      } as LoadVolumeMetadataRequest
    );
  }

  /**
   * Load a single scraping issue based on the provided details.
   *
   * @param args.volumeId the volume id for the scraping issue
   * @param args.issueNumber the issue number for the comic
   * @param args.skipCache the skip cache flag
   */
  loadScrapingIssue(args: {
    metadataSource: MetadataSource;
    volumeId: string;
    issueNumber: string;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.trace('Loading scraping issue:', args);
    return this.http.post(
      interpolate(LOAD_SCRAPING_ISSUE_URL, {
        sourceId: args.metadataSource.id,
        volumeId: args.volumeId,
        issueNumber: args.issueNumber
      }),
      {
        skipCache: args.skipCache
      } as LoadIssueMetadataRequest
    );
  }

  /**
   * Scrape a single comic using the specified issue as the source.
   *
   * @param args.metadataSource the metadata source
   * @param args.issueId the source issue id
   * @param args.comic the comic to be updated
   * @param args.skipCache the skip cache flag
   */
  scrapeComic(args: {
    metadataSource: MetadataSource;
    issueId: string;
    comic: ComicBook;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.trace('Scrape comic:', args);
    return this.http.post(
      interpolate(SCRAPE_COMIC_URL, {
        sourceId: args.metadataSource.id,
        comicId: args.comic.id
      }),
      {
        issueId: args.issueId,
        skipCache: args.skipCache
      } as ScrapeComicRequest
    );
  }

  /**
   * Loads all metadata audit log entries.
   */
  loadAuditLog(): Observable<any> {
    this.logger.trace('Loading metadata audit log entries');
    return this.http.get(interpolate(LOAD_METADATA_AUDIT_LOG_URL));
  }

  /**
   * Clears the metadata audit log.
   */
  clearAuditLog(): Observable<any> {
    this.logger.trace('Clear metadata audit log entries');
    return this.http.delete(interpolate(CLEAR_METADATA_AUDIT_LOG_URL));
  }
}
