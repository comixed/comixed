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
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { LoggerModule } from '@angular-ru/logger';
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
import {
  initialState as initialSessionState,
  SESSION_FEATURE_KEY
} from '@app/reducers/session.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { loadSessionUpdate } from '@app/actions/session.actions';
import { setImportingComicsState } from '@app/library/actions/comic-import.actions';
import { NavigationBarComponent } from '@app/components/navigation-bar/navigation-bar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

describe('AppComponent', () => {
  const USER = USER_READER;
  const TIMESTAMP = new Date().getTime();
  const MAXIMUM_RECORDS = 100;
  const TIMEOUT = 300;

  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [BUSY_FEATURE_KEY]: initialBusyState,
    [SESSION_FEATURE_KEY]: initialSessionState
  };

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore<any>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, NavigationBarComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        MatToolbarModule,
        MatDialogModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatDividerModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
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
        [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
      });
    });

    it('sets the session active flag', () => {
      expect(component.sessionActive).toBeTrue();
    });

    it('redirects the user to the home page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('fires an action to load the session update', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadSessionUpdate({
          timestamp: 0,
          maximumRecords: MAXIMUM_RECORDS,
          timeout: TIMEOUT
        })
      );
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
          importCount: IMPORT_COUNT,
          latest: TIMESTAMP
        }
      });
    });

    it('updates the importing state', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setImportingComicsState({ importing: IMPORT_COUNT !== 0 })
      );
    });

    it('gets the next session update', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadSessionUpdate({
          timestamp: TIMESTAMP,
          maximumRecords: MAXIMUM_RECORDS,
          timeout: TIMEOUT
        })
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
          timestamp: TIMESTAMP,
          maximumRecords: MAXIMUM_RECORDS,
          timeout: TIMEOUT
        })
      );
    });
  });
});
