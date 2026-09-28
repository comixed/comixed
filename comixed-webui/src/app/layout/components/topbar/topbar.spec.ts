/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Topbar } from '@app/layout/components/topbar/topbar';
import { Renderer2 } from '@angular/core';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import {
  initialRemoteLibraryState,
  REMOTE_LIBRARY_FEATURE_KEY
} from '@app/library/reducers/remote-library.reducer';
import {
  BATCH_PROCESS_LIST_FEATURE_KEY,
  initialBatchProcessListState
} from '@app/batch/reducers/batch-process-list.reducer';
import { beforeEach } from 'vitest';
import { USER_ADMIN, USER_READER } from '@app/account/account-fixtures';
import { By } from '@angular/platform-browser';
import {
  initialSelectedComicListState,
  SELECTED_COMIC_LIST_FEATURE_KEY
} from '@app/library/reducers/selected-comic-list.reducer';

describe('Topbar', () => {
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [REMOTE_LIBRARY_FEATURE_KEY]: initialRemoteLibraryState,
    [BATCH_PROCESS_LIST_FEATURE_KEY]: initialBatchProcessListState,
    [SELECTED_COMIC_LIST_FEATURE_KEY]: initialSelectedComicListState
  };

  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topbar],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        {
          provide: Renderer2,
          useValue: {
            setStyle: vi.fn()
          }
        }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the user is not authenticated', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          checked: true,
          user: null
        }
      });
      fixture.detectChanges();
    });

    it('should not show the home button', () => {
      expect(fixture.debugElement.query(By.css('#home-button'))).toBeNull();
    });

    it('should not show the logout button', () => {
      expect(fixture.debugElement.query(By.css('#logout-button'))).toBeNull();
    });
  });

  describe('when the user is a reader', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          checked: true,
          user: USER_READER
        }
      });
      fixture.detectChanges();
    });

    it('should show the home button', () => {
      expect(fixture.debugElement.query(By.css('#home-button'))).not.toBeNull();
    });

    it('should not display the import button', () => {
      expect(
        fixture.debugElement.query(By.css('#import-comics-button'))
      ).toBeNull();
    });

    it('should show the library statistics panel', () => {
      expect(
        fixture.debugElement.query(By.css('#library-statistics'))
      ).not.toBeNull();
    });

    it('should show the logout button', () => {
      expect(
        fixture.debugElement.query(By.css('#logout-button'))
      ).not.toBeNull();
    });
  });

  describe('when the user is an admin', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          checked: true,
          user: USER_ADMIN
        }
      });
      fixture.detectChanges();
    });

    it('should display the import button', () => {
      expect(
        fixture.debugElement.query(By.css('#import-comics-button'))
      ).not.toBeNull();
    });
  });
});
