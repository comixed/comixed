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
import { SideNavigationComponent } from './side-navigation.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { USER_ADMIN, USER_READER } from '@app/user/user.fixtures';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialReadingListsState,
  READING_LISTS_FEATURE_KEY
} from '@app/lists/reducers/reading-lists.reducer';
import {
  initialState as initialLastReadState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/comic-books/reducers/last-read-list.reducer';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import {
  FEATURE_ENABLED_FEATURE_KEY,
  initialState as initialFeatureEnabledState
} from '@app/admin/reducers/feature-enabled.reducer';
import { getFeatureEnabled } from '@app/admin/actions/feature-enabled.actions';
import { BLOCKED_PAGES_ENABLED } from '@app/admin/admin.constants';

describe('SideNavigationComponent', () => {
  const BLOCKED_PAGES_ENABLED_FEATURE_ENABLED = Math.random() > 0.5;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState,
    [FEATURE_ENABLED_FEATURE_KEY]: initialFeatureEnabledState
  };

  let component: SideNavigationComponent;
  let fixture: ComponentFixture<SideNavigationComponent>;
  let store: MockStore;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SideNavigationComponent],
        imports: [
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatListModule,
          MatIconModule
        ],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(SideNavigationComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('the admin flag', () => {
    it('sets it to true for an admin', () => {
      component.user = USER_ADMIN;
      expect(component.isAdmin).toBeTrue();
    });

    it('sets it to false for a reader', () => {
      component.user = USER_READER;
      expect(component.isAdmin).toBeFalse();
    });
  });

  describe('toggling the comic lists', () => {
    const COLLAPSED = Math.random() > 0.5;

    beforeEach(() => {
      component.comicsCollapsed = !COLLAPSED;
      component.onCollapseComics(COLLAPSED);
    });

    it('updates the flag', () => {
      expect(component.comicsCollapsed).toEqual(COLLAPSED);
    });
  });

  describe('toggling the collection lists', () => {
    const COLLAPSED = Math.random() > 0.5;

    beforeEach(() => {
      component.collectionCollapsed = !COLLAPSED;
      component.onCollapseCollection(COLLAPSED);
    });

    it('updates the flag', () => {
      expect(component.collectionCollapsed).toEqual(COLLAPSED);
    });
  });

  describe('toggling the reading lists', () => {
    const COLLAPSED = Math.random() > 0.5;

    beforeEach(() => {
      component.readingListsCollapsed = !COLLAPSED;
      component.onCollapseReadingLists(COLLAPSED);
    });

    it('updates the flag', () => {
      expect(component.readingListsCollapsed).toEqual(COLLAPSED);
    });
  });

  describe('loading the managed blocked pages feature', () => {
    describe('when not previously loaded', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [FEATURE_ENABLED_FEATURE_KEY]: {
            ...initialFeatureEnabledState,
            busy: false,
            features: []
          }
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          getFeatureEnabled({ name: BLOCKED_PAGES_ENABLED })
        );
      });
    });

    describe('when already previously loaded', () => {
      beforeEach(() => {
        component.blockedPagesEnabled = !BLOCKED_PAGES_ENABLED_FEATURE_ENABLED;
        store.setState({
          ...initialState,
          [FEATURE_ENABLED_FEATURE_KEY]: {
            ...initialFeatureEnabledState,
            busy: false,
            features: [
              {
                name: BLOCKED_PAGES_ENABLED,
                enabled: BLOCKED_PAGES_ENABLED_FEATURE_ENABLED
              }
            ]
          }
        });
      });

      it('does not fire an action', () => {
        expect(store.dispatch).not.toHaveBeenCalled();
      });

      it('sets the blocked pages enabled flag', () => {
        expect(component.blockedPagesEnabled).toEqual(
          BLOCKED_PAGES_ENABLED_FEATURE_ENABLED
        );
      });
    });
  });
});
