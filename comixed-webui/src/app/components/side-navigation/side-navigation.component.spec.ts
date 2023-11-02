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
import { provideMockStore } from '@ngrx/store/testing';
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

describe('SideNavigationComponent', () => {
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState
  };

  let component: SideNavigationComponent;
  let fixture: ComponentFixture<SideNavigationComponent>;

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
});
