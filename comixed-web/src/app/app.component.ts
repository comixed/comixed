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
import { getUserPreference, User } from '@app/user';
import { loadCurrentUser } from '@app/user/actions/user.actions';
import { selectBusyState } from '@app/core/selectors/busy.selectors';
import { TranslateService } from '@ngx-translate/core';
import { loadSessionUpdate } from '@app/actions/session.actions';
import { selectUserSessionState } from '@app/selectors/session.selectors';
import { setImportingComicsState } from '@app/library/actions/comic-import.actions';
import { setPageSize } from '@app/library/actions/display.actions';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';
import {
  LANGUAGE_PREFERENCE,
  LOGGER_LEVEL_PREFERENCE
} from '@app/app.constants';
import {
  startMessaging,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';

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
        this.logger.debug('Starting messaging subsystem');
        this.store.dispatch(startMessaging());
        this.logger.trace('Getting first session update');
        this.sessionActive = true;
        this.store.dispatch(
          loadSessionUpdate({ timestamp: 0, maximumRecords: 100, timeout: 300 })
        );
      } else if (!this.user && this.sessionActive) {
        this.logger.trace('Stopping the messaging subsystem');
        this.store.dispatch(stopMessaging());
        this.logger.trace('Stopping user session updates');
        this.sessionActive = false;
      }
      if (!!this.user) {
        this.logger.level =
          LoggerLevel[
            getUserPreference(
              this.user.preferences,
              LOGGER_LEVEL_PREFERENCE,
              `${LoggerLevel.INFO}`
            )
          ];
        this.translateService.use(
          getUserPreference(this.user.preferences, LANGUAGE_PREFERENCE, 'en')
        );
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
      }
    });
    this.store
      .select(selectBusyState)
      .subscribe(state => (this.busy = state.enabled));
    this.store.select(selectUserSessionState).subscribe(state => {
      if (!state.loading && state.initialized) {
        this.logger.debug('Session state updated:', state);
        this.store.dispatch(
          setImportingComicsState({ importing: state.importCount !== 0 })
        );
        if (this.sessionActive) {
          this.logger.debug('Getting next session update');
          this.store.dispatch(
            loadSessionUpdate({
              timestamp: state.latest,
              maximumRecords: 100,
              timeout: 300
            })
          );
        }
      }
    });
  }

  ngOnInit(): void {
    this.logger.debug('Loading current user');
    this.store.dispatch(loadCurrentUser());
  }
}
