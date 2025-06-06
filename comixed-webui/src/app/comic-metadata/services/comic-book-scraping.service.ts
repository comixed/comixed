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
import { Observable, Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  BATCH_SCRAPE_SELECTED_COMICS_URL,
  CLEAR_METADATA_CACHE_URL,
  LOAD_MULTIBOOK_SCRAPING_URL,
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  REMOVE_MULTI_BOOK_COMIC_URL,
  SCRAPE_MULTI_BOOK_COMIC_URL,
  SCRAPE_SINGLE_BOOK_COMIC_URL,
  START_METADATA_UPDATE_PROCESS_URL,
  START_MULTI_BOOK_SCRAPING_URL
} from '@app/library/library.constants';
import { LoadVolumeMetadataRequest } from '@app/comic-metadata/models/net/load-volume-metadata-request';
import { LoadIssueMetadataRequest } from '@app/comic-metadata/models/net/load-issue-metadata-request';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ScrapeSingleBookComicRequest } from '@app/comic-metadata/models/net/scrape-single-book-comic-request';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { StartMetadataUpdateProcessRequest } from '@app/comic-metadata/models/net/start-metadata-update-process-request';
import { Store } from '@ngrx/store';
import { WebSocketService } from '@app/messaging';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import {
  LOAD_STORY_CANDIDATES_URL,
  METADATA_UPDATE_PROCESS_UPDATE_TOPIC,
  SCRAPE_SERIES_URL,
  SCRAPE_STORY_URL
} from '@app/comic-metadata/comic-metadata.constants';
import { MetadataUpdateProcessUpdate } from '@app/comic-metadata/models/net/metadata-update-process-update';
import { metadataUpdateProcessStatusUpdated } from '@app/comic-metadata/actions/metadata-update-process.actions';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { ScrapeSeriesRequest } from '@app/comic-metadata/models/net/scrape-series-request';
import { ScrapeMultiBookComicRequest } from '@app/comic-metadata/models/net/scrape-multi-book-comic-request';
import { LoadMultiBookScrapingRequest } from '@app/comic-metadata/models/net/load-multi-book-scraping-request';
import { ScrapeStoryRequest } from '@app/comic-metadata/models/net/scrape-story-request';

/**
 * Interacts with the REST APIs during scraping.
 */
@Injectable({
  providedIn: 'root'
})
export class ComicBookScrapingService {
  subscription: Subscription;

  constructor(
    private logger: LoggerService,
    private http: HttpClient,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.subscription) {
        this.logger.trace('Subscribing to remote library state updates');
        this.subscription =
          this.webSocketService.subscribe<MetadataUpdateProcessUpdate>(
            METADATA_UPDATE_PROCESS_UPDATE_TOPIC,
            update => {
              this.logger.debug(
                'Received metadata update process update:',
                update
              );
              this.store.dispatch(
                metadataUpdateProcessStatusUpdated({
                  active: update.active,
                  totalComics: update.totalComics,
                  completedComics: update.completedComics
                })
              );
            }
          );
      }
      if (!state.started && !!this.subscription) {
        this.logger.debug(
          'Stopping metadata update process update subscription'
        );
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    });
  }

  /**
   * Retrieves volumes that match the series name being scraped.
   *
   * @param args.metadataSource the metadata source
   * @param args.publisher the publisher name
   * @param args.series the series name
   * @param args.maximumRecords the maximum records to return
   * @param args.skipCache the skip cache flag
   */
  loadScrapingVolumes(args: {
    metadataSource: MetadataSource;
    publisher: string;
    series: string;
    maximumRecords: number;
    skipCache: boolean;
    matchPublisher: boolean;
  }): Observable<any> {
    this.logger.debug('Loading scraping volumes:', args);
    return this.http.post(
      interpolate(LOAD_SCRAPING_VOLUMES_URL, {
        sourceId: args.metadataSource.metadataSourceId
      }),
      {
        publisher: args.publisher,
        series: args.series,
        maxRecords: args.maximumRecords,
        skipCache: args.skipCache,
        matchPublisher: args.matchPublisher
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
    this.logger.debug('Loading scraping issue:', args);
    return this.http.post(
      interpolate(LOAD_SCRAPING_ISSUE_URL, {
        sourceId: args.metadataSource.metadataSourceId,
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
   * @param args.comicBook the comic to be updated
   * @param args.skipCache the skip cache flag
   */
  scrapeSingleBookComic(args: {
    metadataSource: MetadataSource;
    issueId: string;
    comicBook: ComicBook;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.debug('Scrape comic:', args);
    return this.http.put(
      interpolate(SCRAPE_SINGLE_BOOK_COMIC_URL, {
        sourceId: args.metadataSource.metadataSourceId,
        comicId: args.comicBook.comicBookId
      }),
      {
        issueId: args.issueId,
        skipCache: args.skipCache
      } as ScrapeSingleBookComicRequest
    );
  }

  startMultiBookScraping(args: { pageSize: number }): Observable<any> {
    this.logger.debug('Starting multi-book comic scraping');
    return this.http.put(interpolate(START_MULTI_BOOK_SCRAPING_URL), {
      pageSize: args.pageSize,
      pageNumber: 0
    } as ScrapeMultiBookComicRequest);
  }

  loadMultiBookScrapingPage(args: {
    pageSize: number;
    pageNumber: number;
  }): Observable<any> {
    this.logger.debug('Loading multi-books scraping page:', args);
    return this.http.post(interpolate(LOAD_MULTIBOOK_SCRAPING_URL), {
      pageSize: args.pageSize,
      pageNumber: args.pageNumber
    } as LoadMultiBookScrapingRequest);
  }

  removeMultiBookComic(args: {
    comicBook: ComicBook;
    pageSize: number;
  }): Observable<any> {
    this.logger.debug('Removing comic from multi-books scraping:', args);
    return this.http.delete(
      interpolate(REMOVE_MULTI_BOOK_COMIC_URL, {
        comicBookId: args.comicBook.comicBookId,
        pageSize: args.pageSize
      })
    );
  }

  scrapeMultiBookComic(args: {
    metadataSource: MetadataSource;
    issueId: string;
    comicBook: ComicBook;
    skipCache: boolean;
    pageSize: number;
  }): Observable<any> {
    this.logger.debug('Scrape comic:', args);
    return this.http.post(
      interpolate(SCRAPE_MULTI_BOOK_COMIC_URL, {
        sourceId: args.metadataSource.metadataSourceId,
        comicBookId: args.comicBook.comicBookId
      }),
      {
        issueId: args.issueId,
        skipCache: args.skipCache,
        pageSize: args.pageSize
      } as ScrapeSingleBookComicRequest
    );
  }

  batchScrapeComicBooks(): Observable<any> {
    this.logger.debug('Batch scraping selected comic books');
    return this.http.post(interpolate(BATCH_SCRAPE_SELECTED_COMICS_URL), {});
  }

  startMetadataUpdateProcess(args: { skipCache: boolean }): Observable<any> {
    this.logger.debug('Starting metadata update process');
    return this.http.post(interpolate(START_METADATA_UPDATE_PROCESS_URL), {
      skipCache: args.skipCache
    } as StartMetadataUpdateProcessRequest);
  }

  clearCache(): Observable<any> {
    this.logger.debug('Clearing metadata cache');
    return this.http.delete(interpolate(CLEAR_METADATA_CACHE_URL));
  }

  scrapeSeries(args: {
    originalPublisher: string;
    originalSeries: string;
    originalVolume: string;
    source: MetadataSource;
    volume: VolumeMetadata;
  }): Observable<any> {
    this.logger.debug('Fetching issues for series:', args);
    return this.http.post(
      interpolate(SCRAPE_SERIES_URL, { id: args.source.metadataSourceId }),
      {
        originalPublisher: args.originalPublisher,
        originalSeries: args.originalSeries,
        originalVolume: args.originalVolume,
        volumeId: args.volume.id
      } as ScrapeSeriesRequest
    );
  }

  loadStoryCandidates(args: {
    sourceId: number;
    storyName: string;
    maxRecords: number;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.debug('Loading story candidates:', args);
    return this.http.post(
      interpolate(LOAD_STORY_CANDIDATES_URL, { id: args.sourceId }),
      {
        name: args.storyName,
        maxRecords: args.maxRecords,
        skipCache: args.skipCache
      }
    );
  }

  scrapeStory(args: {
    sourceId: number;
    referenceId: string;
    skipCache: boolean;
  }): Observable<any> {
    this.logger.debug('Scraping story:', args);
    return this.http.post(
      interpolate(SCRAPE_STORY_URL, {
        id: args.sourceId,
        referenceId: args.referenceId
      }),
      { skipCache: args.skipCache } as ScrapeStoryRequest
    );
  }
}
