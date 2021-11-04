/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { Subscription } from 'webstomp-client';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { WebSocketService } from '@app/messaging';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import {
  BLOCKED_HASH_LIST_REMOVAL_TOPIC,
  BLOCKED_HASH_LIST_UPDATE_TOPIC,
  DELETE_BLOCKED_PAGES_URL,
  DOWNLOAD_BLOCKED_PAGE_FILE_URL,
  LOAD_ALL_BLOCKED_PAGES_URL,
  LOAD_BLOCKED_PAGE_BY_HASH_URL,
  MARK_PAGES_WITH_HASH_URL,
  REMOVE_BLOCKED_STATE_URL,
  SAVE_BLOCKED_PAGE_URL,
  SET_BLOCKED_STATE_URL,
  UNMARK_PAGES_WITH_HASH_URL,
  UPLOAD_BLOCKED_PAGE_FILE_URL
} from '@app/comic-pages/comic-pages.constants';
import {
  blockedHashRemoved,
  blockedHashUpdated,
  loadBlockedHashList
} from '@app/comic-pages/actions/blocked-hash-list.actions';
import { interpolate } from '@app/core';
import { DeleteBlockedPagesRequest } from '@app/comic-pages/models/net/delete-blocked-pages-request';
import { SetBlockedStateRequest } from '@app/comic-pages/models/net/set-blocked-state-request';
import { MarkPagesWithHashRequest } from '@app/comic-pages/models/net/mark-pages-with-hash-request';
import { UnmarkPagesWithHashRequest } from '@app/comic-pages/models/net/unmark-pages-with-hash-request';

@Injectable({
  providedIn: 'root'
})
export class BlockedPageService {
  updateSubscription: Subscription;
  removalSubscription: Subscription;
  entriesLoaded = false;

  constructor(
    private logger: LoggerService,
    private http: HttpClient,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.updateSubscription) {
        this.logger.trace('Loading blocked page list');
        this.store.dispatch(loadBlockedHashList());
        this.logger.trace('Subscribing to blocked page updates');
        this.updateSubscription = this.webSocketService.subscribe<BlockedHash>(
          BLOCKED_HASH_LIST_UPDATE_TOPIC,
          entry => {
            this.logger.trace('Received blocked page update:', entry);
            this.store.dispatch(blockedHashUpdated({ entry }));
          }
        );
      }
      if (state.started && !this.removalSubscription) {
        this.logger.trace('Subscribing to blocked page removals');
        this.removalSubscription = this.webSocketService.subscribe<BlockedHash>(
          BLOCKED_HASH_LIST_REMOVAL_TOPIC,
          entry => {
            this.logger.trace('Received blocked page removal:', entry);
            this.store.dispatch(blockedHashRemoved({ entry }));
          }
        );
      }
      if (!state.started && !!this.updateSubscription) {
        this.logger.trace('Unsubscribing from blocked page updates');
        this.updateSubscription.unsubscribe();
        this.updateSubscription = null;
      }
      if (!state.started && !!this.removalSubscription) {
        this.logger.trace('Unsubscribing from blocked page removals');
        this.removalSubscription.unsubscribe();
        this.removalSubscription = null;
      }
    });
  }

  /**
   * Retrieves all blocked page entries.
   */
  loadAll(): Observable<any> {
    this.logger.trace('Loading all blocked pages');
    return this.http.get(interpolate(LOAD_ALL_BLOCKED_PAGES_URL));
  }

  /**
   * Loads a single blocked page by its hash.
   *
   * @param args.hash the page hash
   */
  loadByHash(args: { hash: string }): Observable<any> {
    this.logger.trace('Loading blocked page by hash:', args);
    return this.http.get(
      interpolate(LOAD_BLOCKED_PAGE_BY_HASH_URL, { hash: args.hash })
    );
  }

  /**
   * Saves a blocked page.
   *
   * @param args.entry the blocked page entry
   */
  save(args: { entry: BlockedHash }): Observable<any> {
    this.logger.trace('Saving blocked page:', args);
    return this.http.put(
      interpolate(SAVE_BLOCKED_PAGE_URL, { hash: args.entry.hash }),
      args.entry
    );
  }

  /**
   * Sets the blocked state for a page.
   * @param args.page the page
   * @param args.blocked the blocked state
   */
  setBlockedState(args: {
    hashes: string[];
    blocked: boolean;
  }): Observable<any> {
    if (args.blocked) {
      this.logger.trace('Blocking pages with hash:', args);
      return this.http.post(interpolate(SET_BLOCKED_STATE_URL), {
        hashes: args.hashes
      } as SetBlockedStateRequest);
    } else {
      this.logger.trace('Unblocking pages with hash:', args);
      return this.http.post(interpolate(REMOVE_BLOCKED_STATE_URL), {
        hashes: args.hashes
      } as SetBlockedStateRequest);
    }
  }

  /**
   * Downloads a file of blocked pages.
   */
  downloadFile(): Observable<any> {
    this.logger.trace('Download blocked pages file');
    return this.http.get(interpolate(DOWNLOAD_BLOCKED_PAGE_FILE_URL));
  }

  /**
   * Uploads a file of blocked pages.
   *
   * @param args.file the blocked page file
   */
  uploadFile(args: { file: File }): Observable<any> {
    this.logger.trace('Uploading blocked pages file:', args);
    const formData = new FormData();
    formData.append('file', args.file);
    return this.http.post(interpolate(UPLOAD_BLOCKED_PAGE_FILE_URL), formData);
  }

  /**
   * Deletes a set of blocked pages.
   *
   * @param args.entries the blocked page entries
   */
  deleteEntries(args: { entries: BlockedHash[] }): Observable<any> {
    this.logger.trace('Deleting blocked pages:', args);
    return this.http.post(interpolate(DELETE_BLOCKED_PAGES_URL), {
      hashes: args.entries.map(entry => entry.hash)
    } as DeleteBlockedPagesRequest);
  }

  markPagesWithHash(args: {
    hashes: string[];
    deleted: boolean;
  }): Observable<any> {
    if (args.deleted) {
      this.logger.trace('Marking pages with hashes:', args);
      return this.http.post(interpolate(MARK_PAGES_WITH_HASH_URL), {
        hashes: args.hashes
      } as MarkPagesWithHashRequest);
    } else {
      this.logger.trace('Unmarking pages with hashes:', args);
      return this.http.post(interpolate(UNMARK_PAGES_WITH_HASH_URL), {
        hashes: args.hashes
      } as UnmarkPagesWithHashRequest);
    }
  }
}
