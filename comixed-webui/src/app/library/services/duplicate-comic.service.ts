/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import { LoadDuplicateComicsListRequest } from '@app/library/models/net/load-duplicate-comics-list-request';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  LOAD_DUPLICATE_COMIC_LIST_URL,
  LOAD_DUPLICATE_COMICS_URL
} from '@app/library/library.constants';
import { LoadDuplicateComicsRequest } from '@app/library/models/net/load-duplicate-comics-request';

@Injectable({
  providedIn: 'root'
})
export class DuplicateComicService {
  logger = inject(LoggerService);
  http = inject(HttpClient);

  loadDuplicateComicList(args: {
    sortDirection: string;
    pageIndex: number;
    pageSize: number;
    sortBy: string;
  }): Observable<any> {
    this.logger.debug('Loading a list of duplicate comic books:', args);
    return this.http.post(interpolate(LOAD_DUPLICATE_COMIC_LIST_URL), {
      pageSize: args.pageSize,
      pageIndex: args.pageIndex,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadDuplicateComicsListRequest);
  }

  loadDuplicateComics(args: {
    publisher: string;
    series: string;
    volume: string;
    issueNumber: string;
    coverDate: number;
    pageIndex: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading a duplicated comic book:', args);
    return this.http.post(LOAD_DUPLICATE_COMICS_URL, {
      publisher: args.publisher,
      series: args.series,
      volume: args.volume,
      issueNumber: args.issueNumber,
      coverDate: args.coverDate,
      pageIndex: args.pageIndex,
      pageSize: args.pageSize,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadDuplicateComicsRequest);
  }
}
