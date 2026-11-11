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
import { provideRouter } from '@angular/router';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_LIST_FEATURE_KEY,
  initialComicListState
} from '@app/library/reducers/comic-list.reducer';
import { MessageService } from '@openng/optimus-ui/api';
import { ComicListPage } from '@app/library/pages/comic-list-page/comic-list-page';
import { beforeEach, Mock } from 'vitest';
import { RouterTestingHarness } from '@angular/router/testing';
import { SelectedComicListActions } from '@app/library/actions/selected-comic-list.actions';
import { ComicState } from '@app/library/models/comic-state';

describe('ComicListPage', () => {
  const initialState = { [COMIC_LIST_FEATURE_KEY]: initialComicListState };

  let component: ComicListPage;
  let fixture: ComponentFixture<ComicListPage>;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicListPage],
      providers: [
        provideRouter([
          {
            path: 'testing/read',
            component: ComicListPage,
            data: { readComics: true }
          },
          {
            path: 'testing/changed',
            component: ComicListPage,
            data: { changedComics: true }
          },
          {
            path: 'testing/deleted',
            component: ComicListPage,
            data: { deletedComics: true }
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        MessageService
      ]
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    fixture = TestBed.createComponent(ComicListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show the read toggle flag', () => {
    expect(
      harness.routeNativeElement?.querySelector('#read-comic-toggle') || null
    ).toBeNull();
  });

  describe('changing the language', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the page title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });

  describe('read comics', () => {
    beforeEach(async () => {
      component = await harness.navigateByUrl('/testing/read', ComicListPage);
    });

    it('should set the page type', () => {
      expect(component.getPageType()).toStrictEqual('READ');
    });

    it('should set the read state flag', () => {
      expect(component.readComics()).toBeTruthy();
    });

    it('should display the read toggle button', () => {
      expect(
        harness.routeNativeElement?.querySelector('#read-comic-toggle')
      ).not.toBeNull();
    });

    describe('toggling the read flag', () => {
      let toggleSpy: Mock;

      beforeEach(() => {
        toggleSpy = vi.spyOn(component, 'onToggleUnreadOnly');
        const button = harness.routeNativeElement?.querySelector(
          '#read-comic-toggle'
        ) as HTMLButtonElement;
        button.click();
      });

      it('should toggle the read flag', () => {
        expect(toggleSpy).toHaveBeenCalled();
      });
    });

    describe('selecting all comics', () => {
      const TEST_READ_STATE = Math.random() > 0.5;
      const TEST_SELECTED = Math.random() > 0.5;

      let dispatchSpy: Mock;

      beforeEach(() => {
        dispatchSpy = vi.spyOn(component.store, 'dispatch');
        component.readFlag.set(TEST_READ_STATE);
        component.onSelectAll(TEST_SELECTED);
      });

      it('should dispatch an action', () => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          SelectedComicListActions.selectByReadState({
            readState: TEST_READ_STATE,
            selected: TEST_SELECTED
          })
        );
      });
    });
  });

  describe('changed comics', () => {
    beforeEach(async () => {
      component = await harness.navigateByUrl(
        '/testing/changed',
        ComicListPage
      );
    });

    it('should set the page type', () => {
      expect(component.getPageType()).toStrictEqual('CHANGED');
    });

    it('should return the correct target state', () => {
      expect(component.targetComicState).toBe(ComicState.CHANGED);
    });

    describe('selecting all comics', () => {
      const TEST_SELECTED = Math.random() > 0.5;

      let dispatchSpy: Mock;

      beforeEach(() => {
        dispatchSpy = vi.spyOn(component.store, 'dispatch');
        component.onSelectAll(TEST_SELECTED);
      });

      it('should dispatch an action', () => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          SelectedComicListActions.selectByFilter({
            coverMonth: null,
            coverYear: null,
            archiveType: null,
            comicType: null,
            comicState: ComicState.CHANGED,
            unscrapedState: false,
            searchText: '',
            selected: TEST_SELECTED
          })
        );
      });
    });
  });

  describe('deleted comics', () => {
    beforeEach(async () => {
      component = await harness.navigateByUrl(
        '/testing/deleted',
        ComicListPage
      );
    });

    it('should set the page type', () => {
      expect(component.getPageType()).toStrictEqual('DELETED');
    });

    it('should return the correct target state', () => {
      expect(component.targetComicState).toBe(ComicState.DELETED);
    });

    describe('selecting all comics', () => {
      const TEST_SELECTED = Math.random() > 0.5;

      let dispatchSpy: Mock;

      beforeEach(() => {
        dispatchSpy = vi.spyOn(component.store, 'dispatch');
        component.onSelectAll(TEST_SELECTED);
      });

      it('should dispatch an action', () => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          SelectedComicListActions.selectByFilter({
            coverMonth: null,
            coverYear: null,
            archiveType: null,
            comicType: null,
            comicState: ComicState.DELETED,
            unscrapedState: false,
            searchText: '',
            selected: TEST_SELECTED
          })
        );
      });
    });
  });

  describe('the page type', () => {
    it('should return the selected page type', () => {
      component.selectedComics.set(true);
      expect(component.getPageType()).toStrictEqual('SELECTED');
    });

    it('should return the read page type', () => {
      component.readComics.set(true);
      expect(component.getPageType()).toStrictEqual('READ');
    });

    it('should return the changed page type', () => {
      component.changedComics.set(true);
      expect(component.getPageType()).toStrictEqual('CHANGED');
    });

    it('should return the unscraped page type', () => {
      component.unscrapedComics.set(true);
      expect(component.getPageType()).toStrictEqual('UNSCRAPED');
    });

    it('should return the duplicate page type', () => {
      component.duplicateComics.set(true);
      expect(component.getPageType()).toStrictEqual('DUPLICATE');
    });

    it('should return the deleted page type', () => {
      component.deletedComics.set(true);
      expect(component.getPageType()).toStrictEqual('DELETED');
    });
  });
});
