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

import { TestBed } from '@angular/core/testing';
import { CollectionService } from './collection.service';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3,
  COLLECTION_ENTRY_4,
  COLLECTION_ENTRY_5
} from '@app/collections/collections.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TagType } from '@app/collections/models/comic-collection.enum';
import { interpolate } from '@app/core';
import { LOAD_COLLECTION_ENTRIES_URL } from '@app/collections/collections.constants';
import { LoadCollectionEntriesRequest } from '@app/collections/models/net/load-collection-entries-request';
import { LoadCollectionEntriesResponse } from '@app/collections/models/net/load-collection-entries-response';

describe('CollectionService', () => {
  const COLLECTION_LIST = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3,
    COLLECTION_ENTRY_4,
    COLLECTION_ENTRY_5
  ];
  const TAG_TYPE = TagType.TEAMS;
  const PAGE_SIZE = 25;
  const PAGE_INDEX = 10;
  const SORT_BY = 'comic-count';
  const SORT_DIRECTION = 'desc';
  const TOTAL_ENTRIES = Math.floor(Math.random() * 3000);

  let service: CollectionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(CollectionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load a page of collection entries', () => {
    const serviceResponse = {
      entries: COLLECTION_LIST,
      totalEntries: TOTAL_ENTRIES
    } as LoadCollectionEntriesResponse;

    service
      .loadCollectionEntries({
        tagType: TAG_TYPE,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(LOAD_COLLECTION_ENTRIES_URL, { tagType: TAG_TYPE })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadCollectionEntriesRequest);
    req.flush(serviceResponse);
  });
});
