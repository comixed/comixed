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
import {
  LOAD_COMICS_BY_FILTER_URL,
  LOAD_LIBRARY_STATE_URL,
  LOAD_SELECTED_COMICS_URL,
  REMOTE_LIBRARY_STATE_TOPIC
} from '@app/library/library-constants';
import { interpolate } from '@app/app-functions';
import { MessagingStore } from '@app/messaging/stores/messaging-store';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { LibraryStore } from '@app/library/stores/library-store';
import { RemoteLibraryState } from '@app/library/models/net/remote-library-state';
import { WebSocketService } from '@app/messaging/services/web-socket-service';
import { ComicListStore } from '@app/library/stores/comic-list-store';
import { ArchiveType } from '@app/library/models/archive-type';
import { ComicType } from '@app/library/models/comic-type';
import { ComicState } from '@app/library/models/comic-state';
import { LoadSelectedComicsRequest } from '@app/library/models/net/load-selected-comics-request';
import { LoadComicsByFilterRequest } from '@app/library/models/net/load-comics-by-filter-request';
import { LoadComicsResponse } from '@app/library/models/net/load-comics-response';

@Service()
export class LibraryService {
  logger = inject(LoggerService);
  http = inject(HttpClient);
  readonly libraryStore = inject(LibraryStore);
  readonly comicListStore = inject(ComicListStore);
  readonly messagingStore = inject(MessagingStore);
  readonly webSocketService = inject(WebSocketService);

  constructor() {
    toObservable<boolean>(this.messagingStore.isStarted)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: started => {
          if (started) {
            this.logger.trace('Subscribing to library updates');
            this.webSocketService.subscribe<RemoteLibraryState>(
              REMOTE_LIBRARY_STATE_TOPIC,
              update => {
                this.logger.debug('Received library update:', update);
                this.libraryStore.updateState(update);
              }
            );
          }
        }
      });
  }

  loadLibraryState(): void {
    this.logger.trace('Loading remote library state');
    this.http
      .get<RemoteLibraryState>(interpolate(LOAD_LIBRARY_STATE_URL))
      .subscribe({
        next: state => {
          this.logger.debug('Response received:', state);
          this.libraryStore.updateState(state);
        },
        error: error =>
          this.logger.error('Failed to load remote library state', error)
      });
  }

  loadComicsByFilter(args: {
    pageSize: number;
    pageIndex: number;
    coverYear: number | null;
    coverMonth: number | null;
    archiveType: ArchiveType | null;
    comicType: ComicType | null;
    comicState: ComicState | null;
    selected: boolean;
    missing: boolean;
    unscrapedState: boolean;
    searchText: string | null;
    publisher: string | null;
    series: string | null;
    volume: string | null;
    pageCount: number | null;
    sortBy: string;
    sortDirection: string;
  }) {
    this.comicListStore.setLoading(true);
    if (args.selected) {
      this.logger.trace('Loading selected comics:', args);
      this.http
        .post<LoadComicsResponse>(interpolate(LOAD_SELECTED_COMICS_URL), {
          pageSize: args.pageSize,
          pageIndex: args.pageIndex,
          sortBy: args.sortBy,
          sortDirection: args.sortDirection
        } as LoadSelectedComicsRequest)
        .subscribe({
          next: response => {
            this.logger.debug('Response received:', response);
            this.comicListStore.update(response.comics, response.filteredCount);
          },
          error: error =>
            this.logger.error('Failed to load selected comics:', error)
        });
    } else {
      this.logger.trace('Loading comics by filter:', args);
      this.http
        .post<LoadComicsResponse>(interpolate(LOAD_COMICS_BY_FILTER_URL), {
          pageSize: args.pageSize,
          pageIndex: args.pageIndex,
          coverYear: args.coverYear,
          coverMonth: args.coverMonth,
          archiveType: args.archiveType,
          comicType: args.comicType,
          comicState: args.comicState,
          missing: args.missing,
          unscrapedState: args.unscrapedState,
          searchText: args.searchText,
          publisher: args.publisher,
          series: args.series,
          volume: args.volume,
          pageCount: args.pageCount,
          sortBy: args.sortBy,
          sortDirection: args.sortDirection
        } as LoadComicsByFilterRequest)
        .subscribe({
          next: response => {
            this.logger.debug('Response received:', response);
            this.comicListStore.update(response.comics, response.filteredCount);
          },
          error: error =>
            this.logger.error('Failed to load filtered comics:', error)
        });
    }
    this.comicListStore.setLoading(false);
  }
}
