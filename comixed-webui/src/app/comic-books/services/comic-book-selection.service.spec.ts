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

import { ComicBookSelectionService } from './comic-book-selection.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { HttpResponse } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  ADD_SINGLE_COMIC_SELECTION_URL,
  CLEAR_COMIC_BOOK_SELECTION_STATE_URL,
  COMIC_BOOK_SELECTION_UPDATE_TOPIC,
  LOAD_COMIC_BOOK_SELECTIONS_URL,
  REMOVE_SINGLE_COMIC_SELECTION_URL,
  SET_SELECTED_COMIC_BOOKS_BY_FILTER_URL,
  SET_SELECTED_COMIC_BOOKS_BY_ID_URL,
  SET_SELECTED_COMIC_BOOKS_BY_TAG_TYPE_AND_VALUE_URL
} from '@app/comic-books/comic-books.constants';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { MultipleComicBookSelectionRequest } from '@app/comic-books/models/net/multiple-comic-book-selection-request';
import { Subscription } from 'webstomp-client';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  comicBookSelectionUpdate,
  loadComicBookSelections
} from '@app/comic-books/actions/comic-book-selection.actions';
import { TagType } from '@app/collections/models/comic-collection.enum';
import { SetSelectedByIdRequest } from '@app/comic-books/models/net/set-selected-by-id-request';

describe('ComicBookSelectionService', () => {
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const READ_STATE = Math.random() > 0.5;
  const UNSCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const ID = 65;
  const TAG_TYPE = TagType.TEAMS;
  const TAG_VALUE = 'Some team';
  const SELECTED = Math.random() > 0.5;
  const COMIC_BOOK_IDS = [3.2, 96, 9, 21, 98];
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let service: ComicBookSelectionService;
  let httpMock: HttpTestingController;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let store: MockStore<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            send: jasmine.createSpy('WebSocketService.send()'),
            subscribe: jasmine.createSpy('WebSocketService.subscribe()')
          }
        }
      ]
    });

    service = TestBed.inject(ComicBookSelectionService);
    httpMock = TestBed.inject(HttpTestingController);
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the current comic book selection list', () => {
    const serverResponse = [ID];

    service
      .loadSelections()
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(interpolate(LOAD_COMIC_BOOK_SELECTIONS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
  });

  it('can add a single comic book selection', () => {
    const serverResponse = new HttpResponse({});

    service
      .addSingleSelection({ comicBookId: ID })
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(
      interpolate(ADD_SINGLE_COMIC_SELECTION_URL, { comicBookId: ID })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});
    req.flush(serverResponse);
  });

  it('can remove a single comic book selection', () => {
    const serverResponse = new HttpResponse({});

    service
      .removeSingleSelection({ comicBookId: ID })
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(
      interpolate(REMOVE_SINGLE_COMIC_SELECTION_URL, { comicBookId: ID })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(serverResponse);
  });

  it('can set the selection state by filter', () => {
    const serverResponse = new HttpResponse({});

    service
      .setSelectedByFilter({
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        readState: READ_STATE,
        unscrapedState: UNSCRAPED_STATE,
        searchText: SEARCH_TEXT,
        selected: SELECTED
      })
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(
      interpolate(SET_SELECTED_COMIC_BOOKS_BY_FILTER_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      coverYear: COVER_YEAR,
      coverMonth: COVER_MONTH,
      archiveType: ARCHIVE_TYPE,
      comicType: COMIC_TYPE,
      comicState: COMIC_STATE,
      readState: READ_STATE,
      unscrapedState: UNSCRAPED_STATE,
      searchText: SEARCH_TEXT,
      selected: SELECTED
    } as MultipleComicBookSelectionRequest);
    req.flush(serverResponse);
  });

  describe('selecting comic books by tag type and value', () => {
    it('can select', () => {
      const serverResponse = new HttpResponse({});

      service
        .setSelectedByTagTypeAndValue({
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          selected: true
        })
        .subscribe(response => expect(response).toEqual(serverResponse));

      const req = httpMock.expectOne(
        interpolate(SET_SELECTED_COMIC_BOOKS_BY_TAG_TYPE_AND_VALUE_URL, {
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE
        })
      );
      expect(req.request.method).toEqual('PUT');
      req.flush(serverResponse);
    });

    it('can deselect', () => {
      const serverResponse = new HttpResponse({});

      service
        .setSelectedByTagTypeAndValue({
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          selected: false
        })
        .subscribe(response => expect(response).toEqual(serverResponse));

      const req = httpMock.expectOne(
        interpolate(SET_SELECTED_COMIC_BOOKS_BY_TAG_TYPE_AND_VALUE_URL, {
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE
        })
      );
      expect(req.request.method).toEqual('DELETE');
      req.flush(serverResponse);
    });
  });

  it('can select comic books by id', () => {
    const serverResponse = new HttpResponse({});

    service
      .setSelectedById({
        comicBookIds: COMIC_BOOK_IDS,
        selected: SELECTED
      })
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(
      interpolate(SET_SELECTED_COMIC_BOOKS_BY_ID_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      comicBookIds: COMIC_BOOK_IDS,
      selected: SELECTED
    } as SetSelectedByIdRequest);
    req.flush(serverResponse);
  });

  it('can clear the set of selected comic books', () => {
    const serverResponse = new HttpResponse({});

    service
      .clearSelections()
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(
      interpolate(CLEAR_COMIC_BOOK_SELECTION_STATE_URL)
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(serverResponse);
  });

  describe('when messaging starts', () => {
    let topic: string;
    let subscription: any;

    beforeEach(() => {
      service.selectionUpdateSubscription = null;
      webSocketService.subscribe.and.callFake((topicUsed, callback) => {
        topic = topicUsed;
        subscription = callback;
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('loads the initial list of ids', () => {
      expect(store.dispatch).toHaveBeenCalledWith(loadComicBookSelections());
    });

    it('subscribes to user updates', () => {
      expect(topic).toEqual(COMIC_BOOK_SELECTION_UPDATE_TOPIC);
    });

    describe('when updates are received', () => {
      beforeEach(() => {
        subscription([ID]);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          comicBookSelectionUpdate({ ids: [ID] })
        );
      });
    });
  });

  describe('when messaging is stopped', () => {
    const subscription = jasmine.createSpyObj(['unsubscribe']);

    beforeEach(() => {
      service.selectionUpdateSubscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription reference', () => {
      expect(service.selectionUpdateSubscription).toBeNull();
    });
  });
});
