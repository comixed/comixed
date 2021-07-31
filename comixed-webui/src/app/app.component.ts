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

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerLevel, LoggerService } from '@angular-ru/logger';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { loadCurrentUser } from '@app/user/actions/user.actions';
import { selectBusyState } from '@app/core/selectors/busy.selectors';
import { TranslateService } from '@ngx-translate/core';
import { setImportingComicsState } from '@app/comic-file/actions/comic-import.actions';
import {
  setPageSize,
  setPagination
} from '@app/library/actions/display.actions';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_PREFERENCE,
  PAGINATION_DEFAULT,
  PAGINATION_PREFERENCE
} from '@app/library/library.constants';
import {
  LANGUAGE_PREFERENCE,
  LOGGER_LEVEL_PREFERENCE
} from '@app/app.constants';
import {
  startMessaging,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';
import { selectImportCount } from '@app/selectors/import-count.selectors';
import { Subscription } from 'rxjs';
import { selectComicListState } from '@app/comic-book/selectors/comic-list.selectors';
import {
  loadComics,
  resetComicList
} from '@app/comic-book/actions/comic-list.actions';
import { User } from '@app/user/models/user';

@Component({
  selector: 'cx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User = null;
  busy = false;
  sessionActive = false;
  messagingActive = false;
  comicListStateSubscription: Subscription;
  comicsLoaded = false;

  constructor(
    private logger: LoggerService,
    private translateService: TranslateService,
    private store: Store<any>
  ) {
    this.logger.level = LoggerLevel.INFO;
    this.translateService.use('en');
    this.logger.trace('Subscribing to user changes');
    this.store.select(selectUser).subscribe(user => {
      this.logger.debug('User updated:', user);
      this.user = user;
      if (!!this.user && !this.sessionActive) {
        this.logger.trace('Marking the session as active');
        this.sessionActive = true;
        this.logger.trace('Starting messaging subsystem');
        this.store.dispatch(startMessaging());
      }
      if (!!this.user && !this.comicListStateSubscription) {
        this.logger.trace('Resetting the comic list state');
        this.store.dispatch(resetComicList());
        this.logger.trace('Subscribing to comic list state changes');
        this.comicListStateSubscription = this.store
          .select(selectComicListState)
          .subscribe(state => {
            if (!state.loading && state.lastPayload && !this.comicsLoaded) {
              this.logger.debug('Finished loading comics');
              this.comicsLoaded = true;
            }
            if (!state.loading && !this.comicsLoaded) {
              this.logger.debug('Loading a batch of comics');
              this.store.dispatch(loadComics({ lastId: state.lastId }));
            }
          });
      }
      if (!this.user && this.sessionActive) {
        this.logger.trace('Stopping the messaging subsystem');
        this.store.dispatch(stopMessaging());
        this.logger.trace('Marking the session as inactive');
        this.sessionActive = false;
      }
      if (!this.user && this.comicListStateSubscription) {
        this.logger.trace('Unsubscribing from comics list state changes');
        this.comicListStateSubscription.unsubscribe();
        this.comicListStateSubscription = null;
      }
      if (!!this.user) {
        const preferredLevel = parseInt(
          getUserPreference(
            this.user.preferences,
            LOGGER_LEVEL_PREFERENCE,
            `${LoggerLevel.INFO}`
          ),
          10
        );
        switch (preferredLevel) {
          case 1:
            this.logger.level = LoggerLevel.ALL;
            break;
          case 2:
            this.logger.level = LoggerLevel.TRACE;
            break;
          case 3:
            this.logger.level = LoggerLevel.DEBUG;
            break;
          case 4:
            this.logger.level = LoggerLevel.INFO;
            break;
        }
        this.translateService.use(
          getUserPreference(this.user.preferences, LANGUAGE_PREFERENCE, 'en')
        );
        this.loadUserDefaults();
      }
    });
    this.store
      .select(selectBusyState)
      .subscribe(state => (this.busy = state.enabled));
    this.store
      .select(selectImportCount)
      .subscribe(count =>
        this.store.dispatch(setImportingComicsState({ importing: count > 0 }))
      );
  }

  ngOnInit(): void {
    this.logger.debug('Loading current user');
    this.store.dispatch(loadCurrentUser());
  }

  private loadUserDefaults(): void {
    this.store.dispatch(
      setPageSize({
        size: parseInt(
          getUserPreference(
            this.user.preferences,
            PAGE_SIZE_PREFERENCE,
            `${PAGE_SIZE_DEFAULT}`
          ),
          10
        ),
        save: false
      })
    );
    this.store.dispatch(
      setPagination({
        pagination: parseInt(
          getUserPreference(
            this.user.preferences,
            PAGINATION_PREFERENCE,
            `${PAGINATION_DEFAULT}`
          ),
          10
        )
      })
    );
  }
}
