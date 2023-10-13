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

import { ApplicationRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerLevel, LoggerService } from '@angular-ru/cdk/logger';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { loadCurrentUser } from '@app/user/actions/user.actions';
import { selectBusyState } from '@app/core/selectors/busy.selectors';
import { TranslateService } from '@ngx-translate/core';
import {
  DARK_MODE_PREFERENCE,
  LANGUAGE_PREFERENCE,
  LOGGER_LEVEL_PREFERENCE
} from '@app/app.constants';
import {
  startMessaging,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';
import { Subscription } from 'rxjs';
import { User } from '@app/user/models/user';
import { loadLibraryState } from '@app/library/actions/library.actions';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { toggleDarkThemeMode } from '@app/actions/dark-theme.actions';
import { selectDarkThemeActive } from '@app/selectors/dark-theme.selectors';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'cx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User = null;
  busy = false;
  sessionActive = false;
  libraryStateSubscription: Subscription;
  libraryState: LibraryState;
  darkMode = false;

  constructor(
    private logger: LoggerService,
    private translateService: TranslateService,
    private store: Store<any>,
    private overlayContainer: OverlayContainer,
    private app: ApplicationRef
  ) {
    this.logger.level = LoggerLevel.INFO;
    this.translateService.use('en');
    this.logger.trace('Subscribing to user changes');
    this.store.select(selectUser).subscribe(user => {
      this.logger.debug('User updated:', user);
      this.user = user;

      const darkMode =
        getUserPreference(
          this.user?.preferences || [],
          DARK_MODE_PREFERENCE,
          'false'
        ) === `${true}`;
      this.store.dispatch(
        toggleDarkThemeMode({
          toggle: darkMode
        })
      );
      if (!!this.user && !this.sessionActive) {
        this.logger.trace('Marking the session as active');
        this.sessionActive = true;
        this.logger.trace('Starting messaging subsystem');
        this.store.dispatch(startMessaging());
      }
      if (!!this.user && !this.libraryStateSubscription) {
        this.logger.trace('Subscribing to library state');
        this.subscribeToLibraryState();
        this.logger.trace('Loading remote library state');
        this.store.dispatch(loadLibraryState());
      }
      if (!this.user && this.sessionActive) {
        this.logger.trace('Stopping the messaging subsystem');
        this.store.dispatch(stopMessaging());
        this.logger.trace('Marking the session as inactive');
        this.sessionActive = false;
      }
      if (!this.user && this.libraryStateSubscription) {
        this.logger.trace('Unsubscribing from library state changes');
        this.libraryStateSubscription.unsubscribe();
        this.libraryStateSubscription = null;
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
      }
    });
    this.store
      .select(selectBusyState)
      .subscribe(state => (this.busy = state.enabled));
    this.store.select(selectDarkThemeActive).subscribe(toggle => {
      this.darkMode = toggle;
      const element = window.document.body;
      if (this.darkMode) {
        element.classList.add('dark-theme');
        element.classList.remove('lite-theme');
      } else {
        element.classList.add('lite-theme');
        element.classList.remove('dark-theme');
      }
    });
  }

  ngOnInit(): void {
    this.logger.debug('Loading current user');
    this.store.dispatch(loadCurrentUser());
  }

  private subscribeToLibraryState(): void {
    this.libraryStateSubscription = this.store
      .select(selectLibraryState)
      .subscribe(state => (this.libraryState = state));
  }
}
