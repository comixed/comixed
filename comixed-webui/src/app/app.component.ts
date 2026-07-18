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

import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerLevel, LoggerService } from '@angular-ru/cdk/logger';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { loadCurrentUser } from '@app/user/actions/user.actions';
import { selectBusyState } from '@app/core/selectors/busy.selectors';
import { TranslateService } from '@ngx-translate/core';
import {
  APP_MESSAGING_TOPIC,
  DARK_MODE_PREFERENCE,
  LANGUAGE_PREFERENCE,
  LOADING_ICON_URL,
  LOGGER_LEVEL_PREFERENCE,
  SEARCHING_ICON_URL,
  WORKING_ICON_URL
} from '@app/app.constants';
import {
  startMessaging,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';
import { BehaviorSubject } from 'rxjs';
import { User } from '@app/user/models/user';
import { toggleDarkThemeMode } from '@app/actions/dark-theme.actions';
import { selectDarkThemeActive } from '@app/selectors/dark-theme.selectors';
import { BusyIcon } from '@app/core/actions/busy.actions';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { WebSocketService } from '@app/messaging';
import { AlertService } from '@app/core/services/alert.service';
import { filter } from 'rxjs/operators';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent
} from '@angular/material/sidenav';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';
import { EditAccountBarComponent } from './user/components/edit-account-bar/edit-account-bar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { AsyncPipe } from '@angular/common';
import { loadLibraryState } from '@app/library/actions/library.actions';
import { resetReadComicBooks } from '@app/user/actions/read-comic-books.actions';

@Component({
  selector: 'cx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    NavigationBarComponent,
    MatSidenavContainer,
    MatSidenav,
    SideNavigationComponent,
    EditAccountBarComponent,
    MatSidenavContent,
    RouterOutlet,
    FooterComponent,
    AsyncPipe
  ]
})
export class AppComponent implements OnInit {
  @HostBinding('class') currentTheme: 'lite-theme' | 'dark-theme' =
    'lite-theme';

  user$ = new BehaviorSubject<User | null>(null);
  busy$ = new BehaviorSubject(false);
  sessionActive$ = new BehaviorSubject(false);
  darkMode$ = new BehaviorSubject(false);
  busyIcon$ = new BehaviorSubject<BusyIcon>(BusyIcon.DEFAULT);

  logger = inject(LoggerService);
  translateService = inject(TranslateService);
  store = inject(Store);
  webSocketService = inject(WebSocketService);
  alertService = inject(AlertService);

  constructor() {
    this.logger.level = LoggerLevel.INFO;
    this.translateService.use('en');
    this.logger.trace('Subscribing to user changes');
    this.store.select(selectUser).subscribe(user => {
      this.logger.debug('User updated:', user);
      this.user$.next(user);

      const darkMode =
        getUserPreference(
          this.user$.value?.preferences || [],
          DARK_MODE_PREFERENCE,
          'false'
        ) === `${true}`;
      this.store.dispatch(
        toggleDarkThemeMode({
          toggle: darkMode
        })
      );
      if (!!this.user$.value && !this.sessionActive$.value) {
        this.logger.trace('Marking the session as active');
        this.sessionActive$.next(true);
        this.logger.trace('Starting messaging subsystem');
        this.store.dispatch(startMessaging());
        this.store.dispatch(loadLibraryState());
      }
      if (!this.user$.value && this.sessionActive$.value) {
        this.logger.trace('Stopping the messaging subsystem');
        this.store.dispatch(resetReadComicBooks());
        this.store.dispatch(stopMessaging());
        this.logger.trace('Marking the session as inactive');
        this.sessionActive$.next(false);
      }
      if (!!this.user$.value) {
        const preferredLevel = parseInt(
          getUserPreference(
            this.user$.value.preferences,
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
          getUserPreference(
            this.user$.value.preferences,
            LANGUAGE_PREFERENCE,
            'en'
          )
        );
      }
    });
    this.store.select(selectBusyState).subscribe(state => {
      this.busy$.next(state.enabled);
      this.busyIcon$.next(state.icon);
    });
    this.store.select(selectDarkThemeActive).subscribe(toggle => {
      this.darkMode$.next(toggle);
      if (this.darkMode$.value) {
        this.currentTheme = 'dark-theme';
      } else {
        this.currentTheme = 'lite-theme';
      }
    });
    this.store
      .select(selectMessagingState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        if (state.started) {
          this.webSocketService.subscribe(APP_MESSAGING_TOPIC, appEvent => {
            this.logger.debug('Application event message received:', appEvent);
            this.alertService.info(appEvent.message);
          });
        }
      });
  }

  get busyIconURL(): string {
    switch (this.busyIcon$.value) {
      case BusyIcon.LOADING:
        return LOADING_ICON_URL;
      case BusyIcon.SEARCHING:
        return SEARCHING_ICON_URL;
      case BusyIcon.WORKING:
      case BusyIcon.DEFAULT:
      default:
        return WORKING_ICON_URL;
    }
  }

  ngOnInit(): void {
    this.logger.debug('Loading current user');
    this.store.dispatch(loadCurrentUser());
  }
}
