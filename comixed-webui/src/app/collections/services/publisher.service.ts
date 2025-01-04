/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import {
  LOAD_PUBLISHER_DETAIL_URL,
  LOAD_PUBLISHERS_URL
} from '@app/collections/collections.constants';
import { LoadPublisherListRequest } from '@app/collections/models/net/load-publisher-list-request';
import { LoadPublisherDetailRequest } from '@app/collections/models/net/load-publisher-detail-request';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  loadPublishers(args: {
    page: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading all publishers');
    return this.http.post(interpolate(LOAD_PUBLISHERS_URL), {
      page: args.page,
      size: args.size,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadPublisherListRequest);
  }

  loadPublisherDetail(args: {
    name: string;
    pageIndex: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading one publisher:', args);
    return this.http.post(
      interpolate(LOAD_PUBLISHER_DETAIL_URL, { name: args.name }),
      {
        pageSize: args.pageSize,
        pageIndex: args.pageIndex,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadPublisherDetailRequest
    );
  }
}
