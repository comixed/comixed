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
import { Footer } from './footer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideTranslateService } from '@ngx-translate/core';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import { beforeEach } from 'vitest';
import { By } from '@angular/platform-browser';
import { USER_READER } from '@app/account/account-fixtures';
import { provideRouter } from '@angular/router';
import {
  initialRemoteLibraryState,
  REMOTE_LIBRARY_FEATURE_KEY
} from '@app/library/reducers/remote-library.reducer';
import {
  initialSelectedComicListState,
  SELECTED_COMIC_LIST_FEATURE_KEY
} from '@app/library/reducers/selected-comic-list.reducer';
import {
  BATCH_PROCESS_LIST_FEATURE_KEY,
  initialBatchProcessListState
} from '@app/batch/reducers/batch-process-list.reducer';

describe('Footer', () => {
  const TEST_USER = USER_READER;
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [REMOTE_LIBRARY_FEATURE_KEY]: initialRemoteLibraryState,
    [SELECTED_COMIC_LIST_FEATURE_KEY]: initialSelectedComicListState,
    [BATCH_PROCESS_LIST_FEATURE_KEY]: initialBatchProcessListState
  };

  let component: Footer;
  let fixture: ComponentFixture<Footer>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        provideRouter([
          {
            path: '*',
            redirectTo: ''
          }
        ]),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show the library statistics panel', () => {
    expect(
      fixture.debugElement.query(By.css('#library-statistics'))
    ).toBeNull();
  });

  describe('when the user is authenticated', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          checked: true,
          user: TEST_USER
        }
      });
      fixture.detectChanges();
    });

    it('should show the library statistics panel', () => {
      expect(
        fixture.debugElement.query(By.css('#library-statistics'))
      ).not.toBeNull();
    });
  });
});
