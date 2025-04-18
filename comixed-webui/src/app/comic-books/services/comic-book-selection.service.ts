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

import { Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { interpolate } from '@app/core';
import {
  ADD_SINGLE_COMIC_SELECTION_URL,
  CLEAR_COMIC_BOOK_SELECTION_STATE_URL,
  COMIC_BOOK_SELECTION_UPDATE_TOPIC,
  LOAD_COMIC_BOOK_SELECTIONS_URL,
  REMOVE_SINGLE_COMIC_SELECTION_URL,
  SET_SELECTED_BY_UNREAD_STATE_COMIC_BOOKS_URL,
  SET_SELECTED_COMIC_BOOKS_BY_FILTER_URL,
  SET_SELECTED_COMIC_BOOKS_BY_ID_URL,
  SET_SELECTED_COMIC_BOOKS_BY_PUBLISHER_SERIES_VOLUME_URL,
  SET_SELECTED_COMIC_BOOKS_BY_PUBLISHER_URL,
  SET_SELECTED_COMIC_BOOKS_BY_TAG_TYPE_AND_VALUE_URL,
  SET_SELECTED_DUPLICATE_COMIC_BOOKS_URL
} from '@app/comic-books/comic-books.constants';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { MultipleComicBookSelectionRequest } from '@app/comic-books/models/net/multiple-comic-book-selection-request';
import { Store } from '@ngrx/store';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { WebSocketService } from '@app/messaging';
import {
  comicBookSelectionUpdate,
  loadComicBookSelections
} from '@app/comic-books/actions/comic-book-selection.actions';
import { SetSelectedByIdRequest } from '@app/comic-books/models/net/set-selected-by-id-request';
import { SetSelectedByPublisherRequest } from '@app/comic-books/models/net/set-selected-by-publisher-request';
import { SetSelectedByPublisherSeriesVolumeRequest } from '@app/comic-books/models/net/set-selected-by-publisher-series-volume-request';
import { DuplicateComicBooksSelectionRequest } from '@app/comic-books/models/net/duplicate-comic-books-selection-request';
import { UnreadComicBooksSelectionRequest } from '@app/comic-books/models/net/unread-comic-books-selection-request';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';
import { selectUser } from '@app/user/selectors/user.selectors';

@Injectable({
  providedIn: 'root'
})
export class ComicBookSelectionService {
  selectionUpdateSubscription: Subscription;
  email: string | null = null;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) {
    this.store.select(selectUser).subscribe(user => {
      this.email = user?.email;
      this.doSubscribeToSelectionUpdates();
    });

    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.selectionUpdateSubscription) {
        this.doSubscribeToSelectionUpdates();
      }
      if (!state.started && !!this.selectionUpdateSubscription) {
        this.logger.debug('Stopping comic book selection subscription');
        this.selectionUpdateSubscription.unsubscribe();
        this.selectionUpdateSubscription = null;
      }
    });
  }

  loadSelections(): Observable<any> {
    this.logger.debug('Loading current comic book selections');
    return this.http.get(interpolate(LOAD_COMIC_BOOK_SELECTIONS_URL));
  }

  addSingleSelection(args: { comicBookId: number }): Observable<any> {
    this.logger.debug('Setting single comic book selection state:', args);
    return this.http.put(
      interpolate(ADD_SINGLE_COMIC_SELECTION_URL, {
        comicBookId: args.comicBookId
      }),
      {}
    );
  }

  removeSingleSelection(args: { comicBookId: number }): Observable<any> {
    this.logger.debug('Setting single comic book selection state:', args);
    return this.http.delete(
      interpolate(REMOVE_SINGLE_COMIC_SELECTION_URL, {
        comicBookId: args.comicBookId
      }),
      {}
    );
  }

  setSelectedByFilter(args: {
    coverYear: number;
    coverMonth: number;
    archiveType: ArchiveType;
    comicType: ComicType;
    comicState: ComicState;
    unscrapedState: boolean;
    searchText: string;
    selected: boolean;
  }): Observable<any> {
    this.logger.debug('Setting multiple comic book selection state:', args);
    return this.http.post(interpolate(SET_SELECTED_COMIC_BOOKS_BY_FILTER_URL), {
      coverYear: args.coverYear,
      coverMonth: args.coverMonth,
      archiveType: args.archiveType,
      comicType: args.comicType,
      comicState: args.comicState,
      unscrapedState: args.unscrapedState,
      searchText: args.searchText,
      selected: args.selected
    } as MultipleComicBookSelectionRequest);
  }

  setSelectedByTagTypeAndValue(args: {
    tagType: ComicTagType;
    tagValue: string;
    selected: boolean;
  }): Observable<any> {
    if (args.selected) {
      this.logger.debug('Selecting comic books by tag type and value:', args);
      return this.http.put(
        interpolate(SET_SELECTED_COMIC_BOOKS_BY_TAG_TYPE_AND_VALUE_URL, {
          tagType: args.tagType,
          tagValue: args.tagValue
        }),
        {}
      );
    } else {
      this.logger.debug('Selecting comic books by tag type and value:', args);
      return this.http.delete(
        interpolate(SET_SELECTED_COMIC_BOOKS_BY_TAG_TYPE_AND_VALUE_URL, {
          tagType: args.tagType,
          tagValue: args.tagValue
        })
      );
    }
  }

  setSelectedById(args: {
    comicBookIds: number[];
    selected: boolean;
  }): Observable<any> {
    this.logger.debug('Selecting comic books by id:', args);
    return this.http.post(interpolate(SET_SELECTED_COMIC_BOOKS_BY_ID_URL), {
      comicBookIds: args.comicBookIds,
      selected: args.selected
    } as SetSelectedByIdRequest);
  }

  setSelectedByPublisher(args: {
    publisher: string;
    selected: boolean;
  }): Observable<any> {
    this.logger.debug('Selecting comic books by publisher:', args);
    return this.http.post(
      interpolate(SET_SELECTED_COMIC_BOOKS_BY_PUBLISHER_URL),
      {
        publisher: args.publisher,
        selected: args.selected
      } as SetSelectedByPublisherRequest
    );
  }

  setSelectedByPublisherSeriesAndVolume(args: {
    publisher: string;
    series: string;
    volume: string;
    selected: boolean;
  }): Observable<any> {
    this.logger.debug(
      'Selecting comic books by publisher, series, and volume:',
      args
    );
    return this.http.post(
      interpolate(SET_SELECTED_COMIC_BOOKS_BY_PUBLISHER_SERIES_VOLUME_URL),
      {
        publisher: args.publisher,
        series: args.series,
        volume: args.volume,
        selected: args.selected
      } as SetSelectedByPublisherSeriesVolumeRequest
    );
  }

  setDuplicateComicBooksSelectionState(args: {
    selected: boolean;
  }): Observable<any> {
    this.logger.debug('Selecting duplicate comic books:', args);
    return this.http.post(interpolate(SET_SELECTED_DUPLICATE_COMIC_BOOKS_URL), {
      selected: args.selected
    } as DuplicateComicBooksSelectionRequest);
  }

  setUnreadComicBooksSelectionState(args: {
    selected: boolean;
    unreadOnly: boolean;
  }): Observable<any> {
    this.logger.debug('Selecting unread comic books:', args);
    return this.http.post(
      interpolate(SET_SELECTED_BY_UNREAD_STATE_COMIC_BOOKS_URL),
      {
        selected: args.selected,
        unreadOnly: args.unreadOnly
      } as UnreadComicBooksSelectionRequest
    );
  }

  clearSelections(): Observable<any> {
    this.logger.debug('Clearing comic book selections');
    return this.http.delete(interpolate(CLEAR_COMIC_BOOK_SELECTION_STATE_URL));
  }

  private doSubscribeToSelectionUpdates() {
    if (!!this.email) {
      this.logger.trace('Subscribing to comic book selection updates');
      this.selectionUpdateSubscription = this.webSocketService.subscribe<
        number[]
      >(
        interpolate(COMIC_BOOK_SELECTION_UPDATE_TOPIC, { email: this.email }),
        ids => {
          this.logger.debug(
            'Received comic book selection update update:',
            ids
          );
          this.store.dispatch(comicBookSelectionUpdate({ ids }));
        }
      );
      this.logger.debug('Loading the initial set of ids');
      this.store.dispatch(loadComicBookSelections());
    }
  }
}
