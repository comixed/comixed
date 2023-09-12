/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  CONVERT_COMICS_URL,
  EDIT_MULTIPLE_COMICS_URL,
  LOAD_LIBRARY_STATE_URL,
  PURGE_LIBRARY_URL,
  REMOTE_LIBRARY_STATE_TOPIC,
  RESCAN_COMICS_URL,
  SET_READ_STATE_URL,
  START_LIBRARY_CONSOLIDATION_URL,
  UPDATE_METADATA_URL
} from '@app/library/library.constants';
import { SetComicReadRequest } from '@app/library/models/net/set-comic-read-request';
import { ConsolidateLibraryRequest } from '@app/library/models/net/consolidate-library-request';
import { RescanComicsRequest } from '@app/library/models/net/rescan-comics-request';
import { UpdateMetadataRequest } from '@app/library/models/net/update-metadata-request';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ConvertComicsRequest } from '@app/library/models/net/convert-comics-request';
import { PurgeLibraryRequest } from '@app/library/models/net/purge-library-request';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { EditMultipleComicsRequest } from '@app/library/models/net/edit-multiple-comics-request';
import { Store } from '@ngrx/store';
import { WebSocketService } from '@app/messaging';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { User } from '@app/user/models/user';
import { libraryStateLoaded } from '@app/library/actions/library.actions';
import { Subscription } from 'webstomp-client';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  subscription: Subscription;

  constructor(
    private logger: LoggerService,
    private http: HttpClient,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.subscription) {
        this.logger.trace('Subscribing to remote library state updates');
        this.subscription = this.webSocketService.subscribe<User>(
          REMOTE_LIBRARY_STATE_TOPIC,
          state => {
            this.logger.debug('Received library state update:', state);
            this.store.dispatch(libraryStateLoaded({ state }));
          }
        );
      }
      if (!state.started && !!this.subscription) {
        this.logger.debug('Stopping library state update subscription');
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    });
  }

  loadLibraryState(): Observable<any> {
    this.logger.trace('Loading library state');
    return this.http.get(interpolate(LOAD_LIBRARY_STATE_URL));
  }

  /**
   * Sets the read state for a set of comics.
   * @param args.comics the comics to be updated
   * @param args.read the read state
   */
  setRead(args: { comicBooks: ComicDetail[]; read: boolean }): Observable<any> {
    this.logger.trace('Setting comic read state:', args);
    return this.http.put(interpolate(SET_READ_STATE_URL), {
      ids: args.comicBooks.map(comic => comic.comicId),
      read: args.read
    } as SetComicReadRequest);
  }

  startLibraryConsolidation(args: { ids: number[] }): Observable<any> {
    this.logger.trace('Start library consolidation');
    return this.http.post(interpolate(START_LIBRARY_CONSOLIDATION_URL), {
      ids: args.ids,
      deletePhysicalFiles: false
    } as ConsolidateLibraryRequest);
  }

  rescanComics(args: { ids: number[] }): Observable<any> {
    this.logger.trace('Rescan comics:', args.ids);
    return this.http.post(interpolate(RESCAN_COMICS_URL), {
      ids: args.ids
    } as RescanComicsRequest);
  }

  updateMetadata(args: { ids: number[] }): Observable<any> {
    this.logger.trace('Update metadata:', args);
    return this.http.post(interpolate(UPDATE_METADATA_URL), {
      ids: args.ids
    } as UpdateMetadataRequest);
  }

  convertComics(args: {
    comicBooks: ComicDetail[];
    archiveType: ArchiveType;
    renamePages: boolean;
    deletePages: boolean;
  }): Observable<any> {
    this.logger.trace('Converting comics:', args);
    return this.http.post(interpolate(CONVERT_COMICS_URL), {
      ids: args.comicBooks.map(comic => comic.comicId),
      archiveType: args.archiveType,
      renamePages: args.renamePages,
      deletePages: args.deletePages
    } as ConvertComicsRequest);
  }

  purgeLibrary(): Observable<any> {
    this.logger.trace('Purging library');
    return this.http.post(
      interpolate(PURGE_LIBRARY_URL),
      {} as PurgeLibraryRequest
    );
  }

  editMultipleComics(args: {
    comicBooks: ComicDetail[];
    details: EditMultipleComics;
  }): Observable<any> {
    this.logger.trace('Editing multiple comics');
    return this.http.post(interpolate(EDIT_MULTIPLE_COMICS_URL), {
      ids: args.comicBooks.map(comic => comic.comicId),
      publisher: args.details.publisher,
      series: args.details.series,
      volume: args.details.volume,
      issueNumber: args.details.issueNumber,
      imprint: args.details.imprint,
      comicType: args.details.comicType
    } as EditMultipleComicsRequest);
  }
}
