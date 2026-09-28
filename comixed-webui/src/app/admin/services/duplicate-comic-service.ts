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
import { Observable } from 'rxjs';
import { LoadDuplicateComicListRequest } from '@app/library/models/net/load-duplicate-comic-list-request';
import { interpolate } from '@app/app-functions';
import { LoadDuplicateComicListResponse } from '@app/library/models/net/load-duplicate-comic-list-response';
import { LoadDuplicateComicResponse } from '@app/library/models/net/load-duplicate-comic-response';
import { LoadDuplicateComicRequest } from '@app/library/models/net/load-duplicate-comic-request';
import {
  LOAD_DUPLICATE_COMIC_LIST_URL,
  LOAD_DUPLICATE_COMIC_URL
} from '@app/admin/admin-constants';

@Service()
export class DuplicateComicService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);

  loadAll(args: {
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<LoadDuplicateComicListResponse> {
    this.logger.trace('Loading duplicate comic list:', args);
    return this.client.post<LoadDuplicateComicListResponse>(
      interpolate(LOAD_DUPLICATE_COMIC_LIST_URL),
      {
        pageIndex: args.index,
        pageSize: args.size,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadDuplicateComicListRequest
    );
  }

  loadOne(args: {
    publisher: string;
    series: string;
    volume: string;
    issueNumber: string;
    coverDate: number | null;
    index: number;
    size: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<LoadDuplicateComicResponse> {
    this.logger.trace('Loading duplicated comic:', args);
    return this.client.post<LoadDuplicateComicResponse>(
      interpolate(LOAD_DUPLICATE_COMIC_URL),
      {
        publisher: args.publisher,
        series: args.series,
        volume: args.volume,
        issueNumber: args.issueNumber,
        coverDate: args.coverDate,
        pageIndex: args.index,
        pageSize: args.size,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadDuplicateComicRequest
    );
  }
}
