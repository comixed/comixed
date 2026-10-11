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
import { LOAD_PUBLISHERS_URL } from '@app/collections/collections-contants';
import { PublisherStore } from '@app/collections/stores/publishers-store';
import { LoadPublisherListResponse } from '@app/collections/models/net/load-publisher-list-response';

@Service()
export class CollectionService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);
  readonly publisherStore = inject(PublisherStore);

  loadPublishers(args: {
    searchText: string;
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): void {
    this.logger.trace('Loading a page of publishers:', args);
    this.client
      .post(interpolate(LOAD_PUBLISHERS_URL), {
        searchText: args.searchText,
        page: args.index,
        size: args.size,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadPublisherListRequest)
      .subscribe({
        next: response => {
          this.logger.debug('Response received:', response);
          this.publisherStore.updatePublishers(
            (response as LoadPublisherListResponse).publishers,
            (response as LoadPublisherListResponse).total
          );
        },
        error: error => this.logger.error('Error loading publishers:', error)
      });
  }
}
