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
import { LoadPublisherListRequest } from '@app/library/models/net/load-publisher-list-request';
import { interpolate } from '@app/app-functions';
import { LoadPublisherListResponse } from '@app/library/models/net/load-publisher-list-response';
import { LoadSeriesListRequest } from '@app/library/models/net/load-series-list-request';
import { LoadSeriesListResponse } from '@app/library/models/net/load-series-list-response';
import { TagStore } from '@app/collections/stores/tag-store';
import { ComicTagType } from '@app/library/models/comic-tag-type';
import { LoadCollectionEntriesRequest } from '@app/library/models/net/load-collection-entries-request';
import { LoadCollectionEntriesResponse } from '@app/library/models/net/load-collection-entries-response';
import { SeriesDetailStore } from '@app/collections/stores/series-detail-store';
import { LoadSeriesDetailRequest } from '@app/library/models/net/load-series-detail-request';
import { Issue } from '@app/library/models/issue';
import {
  LOAD_COLLECTION_ENTRIES_URL,
  LOAD_PUBLISHER_SERIES_LIST_URL,
  LOAD_PUBLISHER_LIST_URL,
  LOAD_SERIES_DETAIL_URL,
  LOAD_SERIES_LIST_URL
} from '@app/library/library-constants';
import { Observable } from 'rxjs';
import { LoadPublisherSeriesListResponse } from '@app/library/models/net/load-publisher-series-list-response';
import { LoadPublisherSeriesListRequest } from '@app/library/models/net/load-publisher-series-list-request';

@Service()
export class CollectionService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);
  readonly seriesDetailStore = inject(SeriesDetailStore);
  readonly tagStore = inject(TagStore);

  loadPublisherList(args: {
    searchText: string;
    page: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<LoadPublisherListResponse> {
    this.logger.trace('Loading publisher list:', args);
    return this.client.post<LoadPublisherListResponse>(
      interpolate(LOAD_PUBLISHER_LIST_URL),
      {
        searchText: args.searchText,
        page: args.page,
        size: args.size,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadPublisherListRequest
    );
  }

  loadPublisherSeriesList(args: {
    name: string;
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<LoadPublisherSeriesListResponse> {
    this.logger.trace('Loading publisher detail:', args);

    return this.client.post<LoadPublisherSeriesListResponse>(
      interpolate(LOAD_PUBLISHER_SERIES_LIST_URL, { publisherName: args.name }),
      {
        pageIndex: args.index,
        pageSize: args.size,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadPublisherSeriesListRequest
    );
  }

  loadSeriesList(args: {
    searchText: string;
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<LoadSeriesListResponse> {
    this.logger.trace('Loading series list:', args);
    return this.client.post<LoadSeriesListResponse>(
      interpolate(LOAD_SERIES_LIST_URL),
      {
        searchText: args.searchText,
        pageIndex: args.index,
        pageSize: args.size,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadSeriesListRequest
    );
  }

  loadSeriesDetail(args: {
    publisherName: string;
    seriesName: string;
    volume: string;
  }): Observable<Issue[]> {
    this.logger.trace('Loading series detail:', args);
    return this.client.post<Issue[]>(interpolate(LOAD_SERIES_DETAIL_URL), {
      publisher: args.publisherName,
      name: args.seriesName,
      volume: args.volume
    } as LoadSeriesDetailRequest);
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
