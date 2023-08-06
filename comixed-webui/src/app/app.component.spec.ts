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
  initialState as initialImportCountState,
  PROCESS_COMICS_FEATURE_KEY
} from '@app/reducers/process-comics.reducer';
import { LOGGER_LEVEL_PREFERENCE } from '@app/app.constants';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
import { loadComicBooks } from '@app/comic-books/actions/comic-book-list.actions';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideNavigationComponent } from '@app/components/side-navigation/side-navigation.component';
import { FooterComponent } from '@app/components/footer/footer.component';
import { MatListModule } from '@angular/material/list';
import {
  initialState as initialReadingListsState,
  READING_LISTS_FEATURE_KEY
} from '@app/lists/reducers/reading-lists.reducer';
import {
  initialState as initialLastReadState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/last-read/reducers/last-read-list.reducer';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import {
  initialState as initialLibrarySelectionState,
  LIBRARY_SELECTIONS_FEATURE_KEY
} from '@app/library/reducers/library-selections.reducer';
import { LIBRARY_LOAD_MAX_RECORDS } from '@app/comic-books/comic-books.constants';
import {
  DARK_THEME_FEATURE_KEY,
  initialState as initialDarkThemeState
} from '@app/reducers/dark-theme.reducer';

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
    [PROCESS_COMICS_FEATURE_KEY]: initialImportCountState,
    [COMIC_BOOK_LIST_FEATURE_KEY]: initialComicBookListState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState,
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [LIBRARY_SELECTIONS_FEATURE_KEY]: initialLibrarySelectionState,
    [DARK_THEME_FEATURE_KEY]: initialDarkThemeState
  };

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
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
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
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

  describe('loading the comic list', () => {
    describe('starting', () => {
      beforeEach(() => {
        component.comicListStateSubscription = null;
        component.comicsLoaded = false;
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: {
              ...USER,
              preferences: [
                {
                  name: LIBRARY_LOAD_MAX_RECORDS,
                  value: `${MAX_LIBRARY_RECORDS}`
                }
              ]
            }
          },
          [COMIC_BOOK_LIST_FEATURE_KEY]: {
            ...initialComicBookListState,
            loading: false,
            lastPayload: false,
            lastId: LAST_ID
          }
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicBooks({ maxRecords: MAX_LIBRARY_RECORDS, lastId: LAST_ID })
        );
      });
    });

    describe('finishing', () => {
      beforeEach(() => {
        component.comicListStateSubscription = null;
        component.comicsLoaded = false;
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
          [COMIC_BOOK_LIST_FEATURE_KEY]: {
            ...initialComicBookListState,
            loading: false,
            lastPayload: true,
            lastId: LAST_ID
          }
        });
      });

      it('sets the comics loaded flag', () => {
        expect(component.comicsLoaded).toBeTrue();
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
});
