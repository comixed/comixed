/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import { LOAD_COLLECTION_ENTRIES_URL } from '@app/collections/collections.constants';
import { LoadCollectionEntriesRequest } from '@app/collections/models/net/load-collection-entries-request';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  logger = inject(LoggerService);
  http = inject(HttpClient);

  loadCollectionEntries(args: {
    tagType: ComicTagType;
    searchText: string;
    pageIndex: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading collection entries:', args);
    return this.http.post(
      interpolate(LOAD_COLLECTION_ENTRIES_URL, { tagType: args.tagType }),
      {
        searchText: args.searchText,
        pageIndex: args.pageIndex,
        pageSize: args.pageSize,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadCollectionEntriesRequest
    );
  }
}
