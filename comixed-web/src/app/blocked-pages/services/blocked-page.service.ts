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
import { LoggerService } from '@angular-ru/logger';
import { HttpClient } from '@angular/common/http';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { WebSocketService } from '@app/messaging';
import { BlockedPage } from '@app/blocked-pages/blocked-pages.model';
import {
  BLOCKED_PAGE_LIST_REMOVAL_TOPIC,
  BLOCKED_PAGE_LIST_UPDATE_TOPIC,
  DOWNLOAD_BLOCKED_PAGE_FILE_URL,
  LOAD_ALL_BLOCKED_PAGES_URL,
  LOAD_BLOCKED_PAGE_BY_HASH_URL,
  REMOVE_BLOCKED_STATE_URL,
  SAVE_BLOCKED_PAGE_URL,
  SET_BLOCKED_STATE_URL,
  UPLOAD_BLOCKED_PAGE_FILE_URL
} from '@app/blocked-pages/blocked-pages.constants';
import {
  blockedPageListRemoval,
  blockedPageListUpdated,
  loadBlockedPageList
} from '@app/blocked-pages/actions/blocked-page-list.actions';
import { interpolate } from '@app/core';
import { Page } from '@app/library';

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
        this.store.dispatch(loadBlockedPageList());
        this.logger.trace('Subscribing to blocked page updates');
        this.updateSubscription = this.webSocketService.subscribe<BlockedPage>(
          BLOCKED_PAGE_LIST_UPDATE_TOPIC,
          entry => {
            this.logger.debug('Received blocked page update:', entry);
            this.store.dispatch(blockedPageListUpdated({ entry }));
          }
        );
      }
      if (state.started && !this.removalSubscription) {
        this.logger.trace('Subscribing to blocked page removals');
        this.removalSubscription = this.webSocketService.subscribe<BlockedPage>(
          BLOCKED_PAGE_LIST_REMOVAL_TOPIC,
          entry => {
            this.logger.debug('Received blocked page remove:', entry);
            this.store.dispatch(blockedPageListRemoval({ entry }));
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
    this.logger.debug('Service: loading all blocked pages');
    return this.http.get(interpolate(LOAD_ALL_BLOCKED_PAGES_URL));
  }

  /**
   * Loads a single blocked page by its hash.
   *
   * @param args.hash the page hash
   */
  loadByHash(args: { hash: string }): Observable<any> {
    this.logger.debug('Service: loading blocked page by hash:', args);
    return this.http.get(
      interpolate(LOAD_BLOCKED_PAGE_BY_HASH_URL, { hash: args.hash })
    );
  }

  /**
   * Saves a blocked page.
   *
   * @param args.entry the blocked page entry
   */
  save(args: { entry: BlockedPage }): Observable<any> {
    this.logger.debug('Service: saving blocked page:', args);
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
  setBlockedState(args: { page: Page; blocked: boolean }): Observable<any> {
    if (args.blocked) {
      this.logger.debug('Service: blocking pages with hash:', args);
      return this.http.post(
        interpolate(SET_BLOCKED_STATE_URL, { hash: args.page.hash }),
        {}
      );
    } else {
      this.logger.debug('Service: unblocking pages with hash:', args);
      return this.http.delete(
        interpolate(REMOVE_BLOCKED_STATE_URL, { hash: args.page.hash })
      );
    }
  }

  /**
   * Downloads a file of blocked pages.
   */
  downloadFile(): Observable<any> {
    this.logger.debug('Service: download blocked pages file');
    return this.http.get(interpolate(DOWNLOAD_BLOCKED_PAGE_FILE_URL));
  }

  /**
   * Uploads a file of blocked pages.
   *
   * @param args.file the blocked page file
   */
  uploadFile(args: { file: File }): Observable<any> {
    this.logger.debug('Service: uploading blocked pages file:', args);
    const formData = new FormData();
    formData.append('file', args.file);
    return this.http.post(interpolate(UPLOAD_BLOCKED_PAGE_FILE_URL), formData);
  }
}
