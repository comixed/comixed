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
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3
} from '@app/library/library-fixtures';
import {
  initialTagListState,
  TAG_LIST_FEATURE_KEY,
  tagListAdapter,
  TagListState
} from '@app/library/reducers/tag-list.reducer';
import {
  selectTagListBusy,
  selectTagListEntries,
  selectTagListTotal
} from '@app/library/selectors/tag-list.selectors';

describe('TagList Selectors', () => {
  const TEST_TAG_LIST = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3
  ];
  const TEST_TOTAL = 51;

  let state: TagListState;

  beforeEach(() => {
    state = tagListAdapter.setAll(TEST_TAG_LIST, {
      ...initialTagListState,
      total: TEST_TOTAL,
      loading: false
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when loading', () => {
      expect(
        selectTagListBusy({
          [TAG_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when loading', () => {
      expect(
        selectTagListBusy({
          [TAG_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the tag list', () => {
    expect(
      selectTagListEntries({ [TAG_LIST_FEATURE_KEY]: { ...state } })
    ).toStrictEqual(TEST_TAG_LIST);
  });

  it('should return the total tags', () => {
    expect(selectTagListTotal({ [TAG_LIST_FEATURE_KEY]: { ...state } })).toBe(
      TEST_TOTAL
    );
  });
});
