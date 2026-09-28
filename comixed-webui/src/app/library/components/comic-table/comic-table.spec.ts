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
import { ComicTable } from './comic-table';
import { provideTranslateService } from '@ngx-translate/core';
import { ComicState } from '@app/library/models/comic-state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';
import {
  initialSelectedComicListState,
  SELECTED_COMIC_LIST_FEATURE_KEY
} from '@app/library/reducers/selected-comic-list.reducer';
import { provideRouter } from '@angular/router';
import { beforeEach, Mock } from 'vitest';
import { SelectedComicListActions } from '@app/library/actions/selected-comic-list.actions';

describe('ComicTable', () => {
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const initialState = {
    [SELECTED_COMIC_LIST_FEATURE_KEY]: initialSelectedComicListState
  };

  let component: ComicTable;
  let fixture: ComponentFixture<ComicTable>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicTable],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicTable);
    component = fixture.componentInstance;
    component.comics = TEST_COMIC_LIST;
    component.first = 0;
    component.rows = 10;
    component.total = TEST_COMIC_LIST.length;
    component.busy = false;
    store = TestBed.inject(MockStore);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return icons for all comic states', () => {
    Object.values(ComicState).forEach(key =>
      expect(component.getIconForComicState(key)).not.toBe(null)
    );
  });

  describe('toggling a comic selection', () => {
    const TEST_COMIC = TEST_COMIC_LIST[0];
    let previousSelectionState: boolean;
    let dispatchSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(store, 'dispatch');
      const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
        `#comic-${TEST_COMIC.comicId}-select-input input`
      );
      previousSelectionState = checkbox.checked;
      checkbox.click();
      fixture.detectChanges();
    });

    it('should dispatch an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        SelectedComicListActions.selectComic({
          comic: TEST_COMIC,
          selected: !previousSelectionState
        })
      );
    });
  });
});
