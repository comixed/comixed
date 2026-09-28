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
import { Component, Renderer2 } from '@angular/core';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
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
  SELECTED_COMIC_LIST_FEATURE_KEY,
  selectedComicListAdapter
} from '@app/library/reducers/selected-comic-list.reducer';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { ReadComicListActions } from '@app/account/actions/read-comic-list.actions';
import { SelectedComicListActions } from '@app/library/actions/selected-comic-list.actions';

@Component({ template: '<h1>Test Component</h1>' })
class TestComponent {}

describe('Topbar', () => {
  const TEST_COMIC_IDS = [1, 3, 5, 7, 11, 13];
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [REMOTE_LIBRARY_FEATURE_KEY]: initialRemoteLibraryState,
    [BATCH_PROCESS_LIST_FEATURE_KEY]: initialBatchProcessListState,
    [SELECTED_COMIC_LIST_FEATURE_KEY]: initialSelectedComicListState
  };

  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;
  let store: MockStore;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topbar],
      providers: [
        provideRouter([
          { path: 'admin/settings/library', component: TestComponent }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        {
          provide: Renderer2,
          useValue: {
            setStyle: vi.fn()
          }
        },
        DialogService
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload the menu when the language changes', async () => {
    component.menuitems.set([]);
    component.translateService.use('fr');
    await fixture.whenStable();
    expect(component.menuitems()).not.toStrictEqual([]);
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

    it('should not show the menu bar', () => {
      expect(fixture.debugElement.query(By.css('#top-menubar'))).toBeNull();
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

    it('should show the menu bar', () => {
      expect(fixture.debugElement.query(By.css('#top-menubar'))).not.toBeNull();
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

    it('should show the menu bar', () => {
      expect(fixture.debugElement.query(By.css('#top-menubar'))).not.toBeNull();
    });

    describe('going to the library settings page', () => {
      let item: HTMLInputElement;

      beforeEach(() => {
        item = document.querySelector(
          '#topbar-library-settings-page a.p-menubar-item-link'
        ) as HTMLInputElement;
      });

      it('should enable the menu item', () => {
        expect(item.disabled).toBeFalsy();
      });

      it('should redirect the browser', async () => {
        item.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(router.url).toBe('/admin/settings/library');
      });
    });
  });

  describe('when there are comic selections', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          checked: true,
          user: USER_READER
        },
        [SELECTED_COMIC_LIST_FEATURE_KEY]: selectedComicListAdapter.setAll(
          TEST_COMIC_IDS,
          initialSelectedComicListState
        )
      });
      fixture.detectChanges();
    });

    describe('clearing selections', () => {
      let item: HTMLInputElement;

      beforeEach(() => {
        item = document.querySelector(
          '#topbar-clear-selections a.p-menubar-item-link'
        ) as HTMLInputElement;
      });

      it('should enable the menu item', () => {
        expect(item.disabled).toBeFalsy();
      });

      it('should dispatch an action', async () => {
        const dispatchSpy = vi.spyOn(component.store, 'dispatch');
        item.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(dispatchSpy).toHaveBeenCalledWith(
          SelectedComicListActions.clearSelections()
        );
      });
    });

    describe('marking selected item as read', () => {
      let item: HTMLInputElement;

      beforeEach(() => {
        item = document.querySelector(
          '#topbar-mark-comics-read a.p-menubar-item-link'
        ) as HTMLInputElement;
      });

      it('should enable the menu item', () => {
        expect(item.disabled).toBeFalsy();
      });

      it('should dispatch an action', async () => {
        const dispatchSpy = vi.spyOn(component.store, 'dispatch');
        item.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(dispatchSpy).toHaveBeenCalledWith(
          ReadComicListActions.markSelectedComics({ readState: true })
        );
      });
    });

    describe('marking selected item as unread', () => {
      let item: HTMLInputElement;

      beforeEach(() => {
        item = document.querySelector(
          '#topbar-mark-comics-unread a.p-menubar-item-link'
        ) as HTMLInputElement;
      });

      it('should enable the menu item', () => {
        expect(item.disabled).toBeFalsy();
      });

      it('should dispatch an action', async () => {
        const dispatchSpy = vi.spyOn(component.store, 'dispatch');
        item.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(dispatchSpy).toHaveBeenCalledWith(
          ReadComicListActions.markSelectedComics({ readState: false })
        );
      });
    });
  });
});
