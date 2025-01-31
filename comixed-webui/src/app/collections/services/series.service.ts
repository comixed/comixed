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
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  LOAD_SERIES_DETAIL_URL,
  LOAD_SERIES_URL
} from '@app/collections/collections.constants';
import { LoadSeriesDetailRequest } from '@app/collections/models/net/load-series-detail-request';
import { LoadSeriesListRequest } from '@app/collections/models/net/load-series-list-request';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  loadSeries(args: {
    pageIndex: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading series:', args);
    return this.http.post(interpolate(LOAD_SERIES_URL), {
      pageIndex: args.pageIndex,
      pageSize: args.pageSize,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadSeriesListRequest);
  }

  loadSeriesDetail(args: {
    publisher: string;
    name: string;
    volume: string;
  }): Observable<any> {
    this.logger.debug('Loading series detail:', args);
    return this.http.post(interpolate(LOAD_SERIES_DETAIL_URL), {
      publisher: args.publisher,
      name: args.name,
      volume: args.volume
    } as LoadSeriesDetailRequest);
  }
}
