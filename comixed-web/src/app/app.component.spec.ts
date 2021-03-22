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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LoggerLevel, LoggerModule, LoggerService } from '@angular-ru/logger';
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
  IMPORT_COUNT_FEATURE_KEY,
  initialState as initialImportCountState
} from '@app/reducers/import-count.reducer';
import { LOGGER_LEVEL_PREFERENCE } from '@app/app.constants';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  const USER = USER_READER;
  const TIMESTAMP = new Date().getTime();
  const MAXIMUM_RECORDS = 100;
  const TIMEOUT = 300;

  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [BUSY_FEATURE_KEY]: initialBusyState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [IMPORT_COUNT_FEATURE_KEY]: initialImportCountState
  };

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore<any>;
  let logger: LoggerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, NavigationBarComponent],
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
        MatSelectModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
    logger = TestBed.inject(LoggerService);
  }));

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
});
