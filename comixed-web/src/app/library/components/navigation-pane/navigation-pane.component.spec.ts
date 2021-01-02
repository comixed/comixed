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
import { NavigationPaneComponent } from './navigation-pane.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/logger';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MatTreeModule } from '@angular/material/tree';
import { TranslateModule } from '@ngx-translate/core';
import { MatBadgeModule } from '@angular/material/badge';
import { COMIC_2 } from '@app/library/library.fixtures';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavigationPaneComponent', () => {
  const COMIC = COMIC_2;
  const initialState = { [LIBRARY_FEATURE_KEY]: initialLibraryState };

  let component: NavigationPaneComponent;
  let fixture: ComponentFixture<NavigationPaneComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavigationPaneComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatTreeModule,
        MatBadgeModule,
        MatIconModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationPaneComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading the library content', () => {
    beforeEach(() => {
      component.dataSource.data = [];
      store.setState({
        ...initialState,
        [LIBRARY_FEATURE_KEY]: { ...initialLibraryState, comics: [COMIC] }
      });
    });

    it('loads the datasource', () => {
      expect(component.dataSource.data).not.toEqual([]);
    });
  });
});
