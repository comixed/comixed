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
import { ComicCoversComponent } from './comic-covers.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NavigationPaneComponent } from '@app/library/components/navigation-pane/navigation-pane.component';
import { MatTreeModule } from '@angular/material/tree';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MatBadgeModule } from '@angular/material/badge';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGINATION_PREFERENCE } from '@app/library/library.constants';
import { COMIC_1, COMIC_2 } from '@app/library/library.fixtures';
import {
  deselectComics,
  selectComics
} from '@app/library/actions/library.actions';

describe('ComicCoversComponent', () => {
  const PAGINATION = 25;
  const COMIC = COMIC_2;
  const initialState = {
    [DISPLAY_FEATURE_KEY]: initialDisplayState,
    [LIBRARY_FEATURE_KEY]: initialLibraryState
  };

  let component: ComicCoversComponent;
  let fixture: ComponentFixture<ComicCoversComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicCoversComponent, NavigationPaneComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatPaginatorModule,
        MatTreeModule,
        MatBadgeModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicCoversComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('pagination changes', () => {
    beforeEach(() => {
      component.onPaginationChange(PAGINATION);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: PAGINATION_PREFERENCE,
          value: `${PAGINATION}`
        })
      );
    });
  });

  describe('checking if a comic is selected', () => {
    beforeEach(() => {
      component.selected = [COMIC_1];
    });

    it('returns true for selected comics', () => {
      expect(component.isSelected(COMIC_1)).toBeTrue();
    });

    it('returns false for unselected comics', () => {
      expect(component.isSelected(COMIC_2)).toBeFalse();
    });
  });

  describe('when a comic select event is received', () => {
    describe('selecting a comic', () => {
      beforeEach(() => {
        component.onSelectionChanged(COMIC, true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          selectComics({ comics: [COMIC] })
        );
      });
    });

    describe('deselecting a comic', () => {
      beforeEach(() => {
        component.onSelectionChanged(COMIC, false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deselectComics({ comics: [COMIC] })
        );
      });
    });
  });
});
