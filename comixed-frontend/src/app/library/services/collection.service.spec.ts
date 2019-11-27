/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { CollectionType } from 'app/library/models/collection-type.enum';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3,
  COLLECTION_ENTRY_4,
  COLLECTION_ENTRY_5
} from 'app/library/models/collection-entry.fixtures';
import { COMIC_1, COMIC_2, COMIC_3 } from 'app/comics/models/comic.fixtures';
import { interpolate } from 'app/app.functions';
import {
  GET_COLLECTION_ENTRIES_URL,
  GET_PAGE_FOR_ENTRY_URL
} from 'app/library/library.constants';
import { GetCollectionPageResponse } from 'app/library/models/net/get-collection-page-response';
import { GetCollectionPageRequest } from 'app/library/models/net/get-collection-page-request';

describe('CollectionService', () => {
  const COLLECTION_TYPE = CollectionType.CHARACTERS;
  const COLLECTION_ENTRIES = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3,
    COLLECTION_ENTRY_4,
    COLLECTION_ENTRY_5
  ];
  const COLLECTION_NAME = 'Fancy Publisher';
  const PAGE = 17;
  const COUNT = 25;
  const SORT_FIELD = 'addedDate';
  const ASCENDING = false;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];
  const COMIC_COUNT = 3;

  let service: CollectionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CollectionService]
    });

    service = TestBed.get(CollectionService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get collection entries', () => {
    service
      .getEntries(COLLECTION_TYPE)
      .subscribe(response => expect(response).toEqual(COLLECTION_ENTRIES));

    const req = httpMock.expectOne(
      interpolate(GET_COLLECTION_ENTRIES_URL, { type: COLLECTION_TYPE })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(COLLECTION_ENTRIES);
  });

  it('can get a page of comics for a collection', () => {
    service
      .getPageForEntry(
        COLLECTION_TYPE,
        COLLECTION_NAME,
        PAGE,
        COUNT,
        SORT_FIELD,
        ASCENDING
      )
      .subscribe(response =>
        expect(response).toEqual({
          comics: COMICS,
          comicCount: COMIC_COUNT
        } as GetCollectionPageResponse)
      );

    const req = httpMock.expectOne(
      interpolate(GET_PAGE_FOR_ENTRY_URL, {
        type: COLLECTION_TYPE,
        name: COLLECTION_NAME
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      page: PAGE,
      count: COUNT,
      sortField: SORT_FIELD,
      ascending: ASCENDING
    } as GetCollectionPageRequest);
    req.flush({
      comics: COMICS,
      comicCount: COMIC_COUNT
    } as GetCollectionPageResponse);
  });
});
