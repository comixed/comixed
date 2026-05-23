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
import { DashboardPageComponent } from './dashboard-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TitleService } from '@app/core/services/title.service';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { DASHBOARD_PANELS_PREFERENCE } from '@app/dashboard/dashboard.constants';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  initialState as initialServerRuntimeState,
  SERVER_RUNTIME_FEATURE_KEY
} from '@app/admin/reducers/server-runtime.reducer';

describe('DashboardPageComponent', () => {
  const USER = USER_READER;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [SERVER_RUNTIME_FEATURE_KEY]: initialServerRuntimeState
  };
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let titleService: TitleService;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardPageComponent,
        TranslateModule.forRoot(),
        LoggerModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        provideMockStore({ initialState }),
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('contains the library state', () => {
    expect(component.libraryState).not.toBeNull();
  });

  describe('changing the language used', () => {
    beforeEach(() => {
      component.translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('closing a panel', () => {
    const PANEL_TO_REMOVE = 'PANEL_TO_REMOVE';
    const PANELS_BEFORE = `PANEL1|${PANEL_TO_REMOVE}|PANEL3`;
    const PANELS_AFTER = `PANEL1|PANEL3`;

    beforeEach(() => {
      component.panels = PANELS_BEFORE;
      component.closePanel(PANEL_TO_REMOVE);
    });

    it('dispatches and action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: DASHBOARD_PANELS_PREFERENCE,
          value: PANELS_AFTER
        })
      );
    });
  });
});
