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
import { ISSUE_1, ISSUE_2 } from '@app/library/library-fixtures';
import {
  initialSeriesComicListState,
  SERIES_COMIC_LIST_FEATURE_KEY,
  seriesComicListAdapter,
  SeriesComicListState
} from '@app/library/reducers/series-comic-list.reducer';
import {
  selectSeriesComicListBusy,
  selectSeriesComicListEntries
} from '@app/library/selectors/series-comic-list.selectors';

describe('SeriesComicList Selectors', () => {
  const TEST_ISSUE_LIST = [ISSUE_2, ISSUE_1];

  let state: SeriesComicListState;

  beforeEach(() => {
    state = seriesComicListAdapter.setAll(TEST_ISSUE_LIST, {
      ...initialSeriesComicListState,
      busy: false
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when not busy', () => {
      expect(
        selectSeriesComicListBusy({
          [SERIES_COMIC_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when loading', () => {
      expect(
        selectSeriesComicListBusy({
          [SERIES_COMIC_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the series list', () => {
    expect(
      selectSeriesComicListEntries({
        [SERIES_COMIC_LIST_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_ISSUE_LIST);
  });
});
