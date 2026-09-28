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
  DUPLICATE_COMIC_LIST_FEATURE_KEY,
  duplicateComicListAdapter,
  DuplicateComicListState,
  initialDuplicateComicListState
} from '@app/admin/reducers/duplicate-comic-list.reducer';
import {
  selectDuplicateComicListBusy,
  selectDuplicateComicListEntries,
  selectDuplicateComicListTotal
} from '@app/admin/selectors/duplicate-comic-list.selectors';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2
} from '@app/admin/admin-fixtures';

describe('DuplicateComicList Selectors', () => {
  const TEST_DUPLICATE_COMIC_LIST = [DUPLICATE_COMIC_1, DUPLICATE_COMIC_2];
  const TEST_TOTAL = 320;

  let state: DuplicateComicListState;

  beforeEach(() => {
    state = duplicateComicListAdapter.setAll(TEST_DUPLICATE_COMIC_LIST, {
      ...initialDuplicateComicListState,
      busy: false,
      total: TEST_TOTAL
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when busy', () => {
      expect(
        selectDuplicateComicListBusy({
          [DUPLICATE_COMIC_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when busy', () => {
      expect(
        selectDuplicateComicListBusy({
          [DUPLICATE_COMIC_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the duplicate list', () => {
    expect(
      selectDuplicateComicListEntries({
        [DUPLICATE_COMIC_LIST_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_DUPLICATE_COMIC_LIST);
  });

  it('should return the total duplicates', () => {
    expect(
      selectDuplicateComicListTotal({
        [DUPLICATE_COMIC_LIST_FEATURE_KEY]: { ...state }
      })
    ).toBe(TEST_TOTAL);
  });
});
