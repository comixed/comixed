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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {
  LoggerLevel,
  LoggerModule,
  LoggerService
} from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import {
  BUSY_FEATURE_KEY,
  initialState as initialBusyState
} from '@app/core/reducers/busy.reducer';
import { TranslateModule } from '@ngx-translate/core';
import { USER_READER } from '@app/user/user.fixtures';
import { NavigationBarComponent } from '@app/components/navigation-bar/navigation-bar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import {
  IMPORT_COMIC_BOOKS_FEATURE_KEY,
  initialState as initialImportCountState
} from '@app/reducers/import-comic-books.reducer';
import {
  APP_MESSAGING_TOPIC,
  LOADING_ICON_URL,
  LOGGER_LEVEL_PREFERENCE,
  SEARCHING_ICON_URL,
  WORKING_ICON_URL
} from '@app/app.constants';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideNavigationComponent } from '@app/components/side-navigation/side-navigation.component';
import { FooterComponent } from '@app/components/footer/footer.component';
import { MatListModule } from '@angular/material/list';
import {
  initialState as initialReadingListsState,
  READING_LISTS_FEATURE_KEY
} from '@app/lists/reducers/reading-lists.reducer';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import {
  DARK_THEME_FEATURE_KEY,
  initialState as initialDarkThemeState
} from '@app/reducers/dark-theme.reducer';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import {
  FEATURE_ENABLED_FEATURE_KEY,
  initialState as initialFeatureEnabledState
} from '@app/admin/reducers/feature-enabled.reducer';
import { BusyIcon } from '@app/core/actions/busy.actions';
import {
  initialState as initialReadComicBooksState,
  READ_COMIC_BOOKS_FEATURE_KEY
} from '@app/user/reducers/read-comic-books.reducer';
import { Subscription } from 'rxjs';
import { WebSocketService } from '@app/messaging';
import { ApplicationEvent } from '@app/models/messages/application-event';
import { AlertService } from '@app/core/services/alert.service';

describe('AppComponent', () => {
  const USER = USER_READER;
  const TIMESTAMP = new Date().getTime();
  const MAXIMUM_RECORDS = 100;
  const TIMEOUT = 300;
  const MAX_LIBRARY_RECORDS = 1000;
  const LAST_ID = Math.floor(Math.abs(Math.random() * 1000));

  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [BUSY_FEATURE_KEY]: initialBusyState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [IMPORT_COMIC_BOOKS_FEATURE_KEY]: initialImportCountState,
    [READ_COMIC_BOOKS_FEATURE_KEY]: initialReadComicBooksState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState,
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [DARK_THEME_FEATURE_KEY]: initialDarkThemeState,
    [FEATURE_ENABLED_FEATURE_KEY]: { ...initialFeatureEnabledState }
  };

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let alertService: AlertService;
  let store: MockStore<any>;
  let logger: LoggerService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          AppComponent,
          NavigationBarComponent,
          SideNavigationComponent,
          FooterComponent
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          TranslateModule.forRoot(),
          LoggerModule.forRoot(),
          MatToolbarModule,
          MatDialogModule,
          MatMenuModule,
          MatIconModule,
          MatTooltipModule,
          MatFormFieldModule,
          MatDividerModule,
          MatSelectModule,
          MatSidenavModule,
          MatListModule
        ],
        providers: [
          provideMockStore({ initialState }),
          {
            provide: WebSocketService,
            useValue: {
              send: jasmine.createSpy('WebSocketService.send()'),
              subscribe: jasmine.createSpy('WebSocketService.subscribe()')
            }
          },
          AlertService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      webSocketService = TestBed.inject(
        WebSocketService
      ) as jasmine.SpyObj<WebSocketService>;
      alertService = TestBed.inject(AlertService);
      spyOn(alertService, 'info');
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      fixture.detectChanges();
      logger = TestBed.inject(LoggerService);
    })
  );

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('when the user authenticates', () => {
    beforeEach(() => {
      component.sessionActive = false;
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
      });
    });

    it('sets the session active flag', () => {
      expect(component.sessionActive).toBeTrue();
    });

    describe('when the user logs out', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: { ...initialUserState, user: null }
        });
      });

      it('clear the session active flag', () => {
        expect(component.sessionActive).toBeFalse();
      });
    });
  });

  describe('setting user logging preference', () => {
    describe('info level', () => {
      beforeEach(() => {
        logger.level = LoggerLevel.OFF;
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: {
              ...initialUserState.user,
              preferences: [
                { name: LOGGER_LEVEL_PREFERENCE, value: `${LoggerLevel.INFO}` }
              ]
            }
          }
        });
      });

      it('sets the logging level to debug', () => {
        expect(logger.level).toEqual(LoggerLevel.INFO);
      });
    });

    describe('debug level', () => {
      beforeEach(() => {
        logger.level = LoggerLevel.OFF;
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: {
              ...initialUserState.user,
              preferences: [
                { name: LOGGER_LEVEL_PREFERENCE, value: `${LoggerLevel.DEBUG}` }
              ]
            }
          }
        });
      });

      it('sets the logging level to info', () => {
        expect(logger.level).toEqual(LoggerLevel.DEBUG);
      });
    });

    describe('trace level', () => {
      beforeEach(() => {
        logger.level = LoggerLevel.OFF;
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: {
              ...initialUserState.user,
              preferences: [
                { name: LOGGER_LEVEL_PREFERENCE, value: `${LoggerLevel.TRACE}` }
              ]
            }
          }
        });
      });

      it('sets the logging level to info', () => {
        expect(logger.level).toEqual(LoggerLevel.TRACE);
      });
    });

    describe('all logging level', () => {
      beforeEach(() => {
        logger.level = LoggerLevel.OFF;
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: {
              ...initialUserState.user,
              preferences: [
                { name: LOGGER_LEVEL_PREFERENCE, value: `${LoggerLevel.ALL}` }
              ]
            }
          }
        });
      });

      it('sets the logging level to info', () => {
        expect(logger.level).toEqual(LoggerLevel.ALL);
      });
    });
  });

  describe('toggling dark mode', () => {
    const DARK_MODE = Math.random() > 0.5;

    beforeEach(() => {
      store.setState({
        ...initialState,
        [DARK_THEME_FEATURE_KEY]: {
          ...initialDarkThemeState,
          toggle: !DARK_MODE
        }
      });
      store.setState({
        ...initialState,
        [DARK_THEME_FEATURE_KEY]: {
          ...initialDarkThemeState,
          toggle: DARK_MODE
        }
      });
    });

    it('updates the component state', () => {
      expect(component.darkMode).toEqual(DARK_MODE);
    });
  });

  describe('busy icon urls', () => {
    it('returns the loading image url', () => {
      component.busyIcon = BusyIcon.LOADING;
      expect(component.busyIconURL).toEqual(LOADING_ICON_URL);
    });

    it('returns the searcing image url', () => {
      component.busyIcon = BusyIcon.SEARCHING;
      expect(component.busyIconURL).toEqual(SEARCHING_ICON_URL);
    });

    it('returns the working image url', () => {
      component.busyIcon = BusyIcon.WORKING;
      expect(component.busyIconURL).toEqual(WORKING_ICON_URL);
    });

    it('returns the default image url', () => {
      component.busyIcon = BusyIcon.DEFAULT;
      expect(component.busyIconURL).toEqual(WORKING_ICON_URL);
    });
  });

  describe('when messaging starts', () => {
    let topic: string;
    let subscription: any;

    beforeEach(() => {
      component.appMessagingSubscription = null;
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

    it('subscribes to user updates', () => {
      expect(topic).toEqual(APP_MESSAGING_TOPIC);
    });

    describe('when updates are received', () => {
      const APP_MESSAGE = 'This is the sample message.';

      beforeEach(() => {
        subscription({ message: APP_MESSAGE } as ApplicationEvent);
      });

      it('notifies the user', () => {
        expect(alertService.info).toHaveBeenCalledWith(APP_MESSAGE);
      });
    });
  });

  describe('when messaging is stopped', () => {
    const subscription = jasmine.createSpyObj(['unsubscribe']);

    beforeEach(() => {
      component.appMessagingSubscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription reference', () => {
      expect(component.appMessagingSubscription).toBeNull();
    });
  });
});
