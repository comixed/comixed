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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {LoggerModule} from '@angular-ru/logger';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import {
  BUSY_FEATURE_KEY,
  initialState as initialBusyState
} from '@app/core/reducers/busy.reducer';
import {TranslateModule} from '@ngx-translate/core';
import {
  initialState as initialSessionState,
  SESSION_FEATURE_KEY
} from '@app/reducers/session.reducer';
import {USER_READER} from '@app/user/user.fixtures';
import {loadSessionUpdate} from '@app/actions/session.actions';
import {SESSION_TIMEOUT} from '@app/app.constants';
import {setImportingComicsState} from '@app/library/actions/comic-import.actions';

describe('AppComponent', () => {
  const USER = USER_READER;

  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [BUSY_FEATURE_KEY]: initialBusyState,
    [SESSION_FEATURE_KEY]: initialSessionState
  };

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot()
      ],
      declarations: [AppComponent],
      providers: [provideMockStore({initialState})]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('when the user authenticates', () => {
    beforeEach(() => {
      component.sessionActive = false;
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {...initialUserState, user: USER}
      });
    });

    it('sets the session active flag', () => {
      expect(component.sessionActive).toBeTruthy();
    });

    it('fires an action to load the session update', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadSessionUpdate({reset: true, timeout: SESSION_TIMEOUT})
      );
    });

    describe('when the user logs out', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {...initialUserState, user: null}
        });
      });

      it('clear the session active flag', () => {
        expect(component.sessionActive).toBeFalsy();
      });
    });
  });

  describe('when a session update is loaded', () => {
    const IMPORT_COUNT = Math.random() > 0.5 ? 717 : 0;

    beforeEach(() => {
      component.sessionActive = true;
      store.setState({
        ...initialState,
        [SESSION_FEATURE_KEY]: {
          ...initialSessionState,
          loading: false,
          initialized: true,
          importCount: IMPORT_COUNT
        }
      });
    });

    it('updates the importing state', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setImportingComicsState({importing: IMPORT_COUNT !== 0})
      );
    });

    it('gets the next session update', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadSessionUpdate({reset: false, timeout: SESSION_TIMEOUT})
      );
    });
  });

  describe('when the user logs out', () => {
    beforeEach(() => {
      component.sessionActive = false;
      store.setState({
        ...initialState,
        [SESSION_FEATURE_KEY]: {
          ...initialSessionState,
          loading: false,
          initialized: true
        }
      });
    });

    it('does not get the next session update', () => {
      expect(store.dispatch).not.toHaveBeenCalledWith(
        loadSessionUpdate({
          reset: false,
          timeout: SESSION_TIMEOUT
        })
      );
    });
  });
});
