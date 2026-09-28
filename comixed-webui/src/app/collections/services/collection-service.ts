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
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { LoadPublisherListRequest } from '@app/collections/models/net/load-publisher-list-request';
import { interpolate } from '@app/app-functions';
import {
  LOAD_COLLECTION_ENTRIES_URL,
  LOAD_PUBLISHER_DETAIL_URL,
  LOAD_PUBLISHER_LIST_URL,
  LOAD_SERIES_DETAIL_URL,
  LOAD_SERIES_LIST_URL
} from '@app/collections/collections-contants';
import { PublisherListStore } from '@app/collections/stores/publisher-list-store';
import { LoadPublisherListResponse } from '@app/collections/models/net/load-publisher-list-response';
import { SeriesListStore } from '@app/collections/stores/series-list-store';
import { LoadSeriesListRequest } from '@app/collections/models/net/load-series-list-request';
import { LoadSeriesListResponse } from '@app/collections/models/net/load-series-list-response';
import { TagStore } from '@app/collections/stores/tag-store';
import { ComicTagType } from '@app/library/models/comic-tag-type';
import { LoadCollectionEntriesRequest } from '@app/collections/models/net/load-collection-entries-request';
import { LoadCollectionEntriesResponse } from '@app/collections/models/net/load-collection-entries-response';
import { PublisherDetailStore } from '@app/collections/stores/publisher-detail-store';
import { LoadPublisherDetailResponse } from '@app/collections/models/net/load-publisher-detail-response';
import { LoadPublisherDetailRequest } from '@app/collections/models/net/load-publisher-detail-request';
import { SeriesDetailStore } from '@app/collections/stores/series-detail-store';
import { LoadSeriesDetailRequest } from '@app/collections/models/net/load-series-detail-request';
import { Issue } from '@app/collections/models/issue';

@Service()
export class CollectionService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);
  readonly publisherListStore = inject(PublisherListStore);
  readonly publisherDetailStore = inject(PublisherDetailStore);
  readonly seriesListStore = inject(SeriesListStore);
  readonly seriesDetailStore = inject(SeriesDetailStore);
  readonly tagStore = inject(TagStore);

  loadPublisherList(args: {
    searchText: string;
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): void {
    this.logger.trace('Loading publisher list:', args);
    this.client
      .post<LoadPublisherListResponse>(interpolate(LOAD_PUBLISHER_LIST_URL), {
        searchText: args.searchText,
        page: args.index,
        size: args.size,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadPublisherListRequest)
      .subscribe({
        next: response => {
          this.logger.debug('Publisher list received:', response);
          this.publisherListStore.update(response.publishers, response.total);
        },
        error: error =>
          this.logger.error('Error loading publisher lists:', error)
      });
  }

  loadPublisherDetail(args: {
    name: string;
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }) {
    this.logger.trace('Loading publisher detail:', args);
    this.client
      .post<LoadPublisherDetailResponse>(
        interpolate(LOAD_PUBLISHER_DETAIL_URL, { publisherName: args.name }),
        {
          pageSize: args.size,
          pageIndex: args.index,
          sortBy: args.sortBy,
          sortDirection: args.sortDirection
        } as LoadPublisherDetailRequest
      )
      .subscribe({
        next: response => {
          this.logger.debug('Publisher detail received:', response);
          this.publisherDetailStore.update(
            args.name,
            response.entries,
            response.totalSeries,
            args.index,
            args.size
          );
        },
        error: error =>
          this.logger.error('Error loading publisher detail:', error)
      });
  }

  loadSeriesList(args: {
    searchText: string;
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): void {
    this.logger.trace('Loading series list:', args);
    this.client
      .post<LoadSeriesListResponse>(interpolate(LOAD_SERIES_LIST_URL), {
        searchText: args.searchText,
        pageIndex: args.index,
        pageSize: args.size,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadSeriesListRequest)
      .subscribe({
        next: response => {
          this.logger.debug('Series list received:', response);
          this.seriesListStore.update(response.series, response.total);
        },
        error: error => this.logger.error('Error loading series list:', error)
      });
  }

  loadSeriesDetail(args: {
    publisherName: string;
    seriesName: string;
    volume: string;
  }) {
    this.logger.trace('Loading series detail:', args);
    this.client
      .post<Issue[]>(interpolate(LOAD_SERIES_DETAIL_URL), {
        publisher: args.publisherName,
        name: args.seriesName,
        volume: args.volume
      } as LoadSeriesDetailRequest)
      .subscribe({
        next: response => {
          this.logger.debug('Series detail received:', response);
          this.seriesDetailStore.update(response);
        },
        error: error => this.logger.error('Error loading series detail:', error)
      });
  }

  loadCollectionEntryList(args: {
    tagType: ComicTagType;
    searchText: string;
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): void {
    this.logger.trace('Loading collection entry list:', args);
    this.client
      .post<LoadCollectionEntriesResponse>(
        interpolate(LOAD_COLLECTION_ENTRIES_URL, { tagType: args.tagType }),
        {
          searchText: args.searchText,
          pageIndex: args.index,
          pageSize: args.size,
          sortBy: args.sortBy,
          sortDirection: args.sortDirection
        } as LoadCollectionEntriesRequest
      )
      .subscribe({
        next: response => {
          this.logger.debug('Collection entries received:', response);
          this.tagStore.update(response.entries, response.totalEntries);
        },
        error: error =>
          this.logger.error('Error loading collection entry list:', error)
      });
  }
}
