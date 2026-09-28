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

import { TestBed } from '@angular/core/testing';
import { LibraryService } from './library-service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/app-functions';
import { COMIC_1, REMOTE_LIBRARY } from '@app/library/library-fixtures';
import {
  LOAD_COMICS_BY_FILTER_URL,
  LOAD_LIBRARY_STATE_URL,
  LOAD_READ_COMICS_URL,
  LOAD_SELECTED_COMICS_URL,
  LOAD_UNREAD_COMICS_URL
} from '@app/library/library-constants';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import {
  initialRemoteLibraryState,
  REMOTE_LIBRARY_FEATURE_KEY
} from '@app/library/reducers/remote-library.reducer';
import { ArchiveType } from '@app/library/models/archive-type';
import { ComicType } from '@app/library/models/comic-type';
import { ComicState } from '@app/library/models/comic-state';
import { LoadComicsByFilterRequest } from '@app/library/models/net/load-comics-by-filter-request';
import { LoadSelectedComicsRequest } from '@app/library/models/net/load-selected-comics-request';
import { Mock } from 'vitest';

describe('LibraryService', () => {
  const initialState = {
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [REMOTE_LIBRARY_FEATURE_KEY]: initialRemoteLibraryState
  };
  const TEST_REMOTE_LIBRARY = REMOTE_LIBRARY;
  const TEST_COMIC = COMIC_1;
  const TEST_COMIC_LIST = [TEST_COMIC];
  const TEST_PAGE_INDEX = 3;
  const TEST_PAGE_SIZE = 10;
  const TEST_COVER_YEAR = 2026;
  const TEST_COVER_MONTH = 10;
  const TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  const TEST_COMIC_TYPE = ComicType.ISSUE;
  const TEST_COMIC_STATE = ComicState.DISCOVERED;
  const TEST_SEARCH_TEXT = 'Some Search Text';
  const TEST_PUBLISHER = 'The Publisher';
  const TEST_SERIES = 'The Series';
  const TEST_VOLUME = '2026';
  const TEST_PAGE_COUNT = 22;
  const TEST_SORT_BY = 'series';
  const TEST_SORT_DIRECTION = 'asc';

  let service: LibraryService;
  let httpController: HttpTestingController;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideMockStore({ initialState })
      ]
    });

    httpController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(LibraryService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when messaging starts', () => {
    let subscribeSpy: Mock;

    beforeEach(() => {
      subscribeSpy = vi.spyOn(service.webSocketService, 'subscribe');
      store.setState({
        ...initialMessagingState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('should subscribe to batch process updates', () => {
      expect(subscribeSpy).toHaveBeenCalled();
    });
  });

  it('should load the library state', () => {
    const serverResponse = TEST_REMOTE_LIBRARY;

    service.loadState().subscribe({
      next: response => expect(response).toStrictEqual(serverResponse)
    });

    const req = httpController.expectOne(interpolate(LOAD_LIBRARY_STATE_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should load comics by filter state', () => {
    const serverResponse = TEST_COMIC_LIST;

    service
      .loadComicListByFilter({
        pageSize: TEST_PAGE_SIZE,
        pageIndex: TEST_PAGE_INDEX,
        coverYear: TEST_COVER_YEAR,
        coverMonth: TEST_COVER_MONTH,
        archiveType: TEST_ARCHIVE_TYPE,
        comicType: TEST_COMIC_TYPE,
        comicState: TEST_COMIC_STATE,
        selected: false,
        unscrapedState: false,
        missing: false,
        searchText: TEST_SEARCH_TEXT,
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        pageCount: TEST_PAGE_COUNT,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(LOAD_COMICS_BY_FILTER_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: TEST_PAGE_SIZE,
      pageIndex: TEST_PAGE_INDEX,
      coverYear: TEST_COVER_YEAR,
      coverMonth: TEST_COVER_MONTH,
      archiveType: TEST_ARCHIVE_TYPE,
      comicType: TEST_COMIC_TYPE,
      comicState: TEST_COMIC_STATE,
      unscrapedState: false,
      missing: false,
      searchText: TEST_SEARCH_TEXT,
      publisher: TEST_PUBLISHER,
      series: TEST_SERIES,
      volume: TEST_VOLUME,
      pageCount: TEST_PAGE_COUNT,
      sortBy: TEST_SORT_BY,
      sortDirection: TEST_SORT_DIRECTION
    } as LoadComicsByFilterRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should load selected comics by filter state', () => {
    const serverResponse = TEST_COMIC_LIST;

    service
      .loadComicListByFilter({
        pageSize: TEST_PAGE_SIZE,
        pageIndex: TEST_PAGE_INDEX,
        coverYear: TEST_COVER_YEAR,
        coverMonth: TEST_COVER_MONTH,
        archiveType: TEST_ARCHIVE_TYPE,
        comicType: TEST_COMIC_TYPE,
        comicState: TEST_COMIC_STATE,
        selected: true,
        unscrapedState: false,
        missing: false,
        searchText: TEST_SEARCH_TEXT,
        publisher: TEST_PUBLISHER,
        series: TEST_SERIES,
        volume: TEST_VOLUME,
        pageCount: TEST_PAGE_COUNT,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(interpolate(LOAD_SELECTED_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: TEST_PAGE_SIZE,
      pageIndex: TEST_PAGE_INDEX,
      sortBy: TEST_SORT_BY,
      sortDirection: TEST_SORT_DIRECTION
    } as LoadSelectedComicsRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should load read comics', () => {
    const serverResponse = TEST_COMIC_LIST;

    service
      .loadByReadState({
        unreadOnly: false,
        pageSize: TEST_PAGE_SIZE,
        pageIndex: TEST_PAGE_INDEX,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(interpolate(LOAD_READ_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: TEST_PAGE_SIZE,
      pageIndex: TEST_PAGE_INDEX,
      sortBy: TEST_SORT_BY,
      sortDirection: TEST_SORT_DIRECTION
    } as LoadSelectedComicsRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should load read uncomics', () => {
    const serverResponse = TEST_COMIC_LIST;

    service
      .loadByReadState({
        unreadOnly: true,
        pageSize: TEST_PAGE_SIZE,
        pageIndex: TEST_PAGE_INDEX,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(interpolate(LOAD_UNREAD_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: TEST_PAGE_SIZE,
      pageIndex: TEST_PAGE_INDEX,
      sortBy: TEST_SORT_BY,
      sortDirection: TEST_SORT_DIRECTION
    } as LoadSelectedComicsRequest);
    req.flush(serverResponse);
    httpController.verify();
  });
});
