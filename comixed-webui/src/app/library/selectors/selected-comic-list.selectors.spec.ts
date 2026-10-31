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

import { beforeEach } from 'vitest';
import {
  initialSelectedComicListState,
  SELECTED_COMIC_LIST_FEATURE_KEY,
  selectedComicListAdapter,
  SelectedComicListState
} from '@app/library/reducers/selected-comic-list.reducer';
import {
  selectSelectedComicListBusy,
  selectSelectedComicListEntries
} from '@app/library/selectors/selected-comic-list.selectors';

describe('SelectecComicList Selectors', () => {
  const TEST_COMIC_ID_LIST = [1, 3, 5, 7, 9];

  let state: SelectedComicListState;

  beforeEach(() => {
    state = { ...initialSelectedComicListState };
  });

  describe('the busy flag', () => {
    it('should return true when busy', () => {
      expect(
        selectSelectedComicListBusy({
          [SELECTED_COMIC_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });

    it('should return false when not busy', () => {
      expect(
        selectSelectedComicListBusy({
          [SELECTED_COMIC_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });
  });

  it('should return the selected comic id list', () => {
    expect(
      selectSelectedComicListEntries({
        [SELECTED_COMIC_LIST_FEATURE_KEY]: selectedComicListAdapter.setAll(
          TEST_COMIC_ID_LIST,
          { ...state }
        )
      })
    ).toStrictEqual(TEST_COMIC_ID_LIST);
  });
});
