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

import { COMIC_1 } from '@app/library/library-fixtures';
import { beforeEach } from 'vitest';
import {
  initialPublisherComicListState,
  PUBLISHER_COMIC_LIST_FEATURE_KEY,
  publisherComicListAdaptor,
  PublisherComicListState
} from '@app/library/reducers/publisher-comic-list.reducer';
import {
  selectPublisherComicListBusy,
  selectPublisherComicListEntries,
  selectPublisherComicListFilteredTotal,
  selectPublisherComicListTotal
} from '@app/library/selectors/publisher-comic-list.selectors';

describe('', () => {
  const TEST_COMIC_LIST = [COMIC_1];
  const TEST_TOTAL = 417;
  const TEST_FILTERED_TOTAL = 320;

  let state: PublisherComicListState;

  beforeEach(() => {
    state = publisherComicListAdaptor.setAll(TEST_COMIC_LIST, {
      ...initialPublisherComicListState,
      total: TEST_TOTAL,
      loading: false
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when loading', () => {
      expect(
        selectPublisherComicListBusy({
          [PUBLISHER_COMIC_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when loading', () => {
      expect(
        selectPublisherComicListBusy({
          [PUBLISHER_COMIC_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the comic list', () => {
    expect(
      selectPublisherComicListEntries({
        [PUBLISHER_COMIC_LIST_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_COMIC_LIST);
  });

  it('should return the total comics', () => {
    expect(
      selectPublisherComicListTotal({
        [PUBLISHER_COMIC_LIST_FEATURE_KEY]: { ...state }
      })
    ).toBe(TEST_TOTAL);
  });

  it('should return the total filtered comics', () => {
    expect(
      selectPublisherComicListFilteredTotal({
        [PUBLISHER_COMIC_LIST_FEATURE_KEY]: {
          ...state,
          filteredTotal: TEST_FILTERED_TOTAL
        }
      })
    ).toBe(TEST_FILTERED_TOTAL);
  });
});
