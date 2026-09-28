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

import { SERIES_1 } from '@app/library/library-fixtures';
import { beforeEach } from 'vitest';
import {
  initialPublisherSeriesListState,
  PUBLISHER_SERIES_LIST_FEATURE_KEY,
  publisherSeriesListAdapter,
  PublisherSeriesListState
} from '@app/library/reducers/publisher-series-list.reducer';
import {
  selectPublisherSeriesListBusy,
  selectPublisherSeriesListEntries,
  selectPublisherSeriesListTotal
} from '@app/library/selectors/publisher-series-list.selectors';

describe('', () => {
  const TEST_SERIES_LIST = [SERIES_1];
  const TEST_TOTAL = 417;

  let state: PublisherSeriesListState;

  beforeEach(() => {
    state = publisherSeriesListAdapter.setAll(TEST_SERIES_LIST, {
      ...initialPublisherSeriesListState,
      total: TEST_TOTAL,
      loading: false
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when loading', () => {
      expect(
        selectPublisherSeriesListBusy({
          [PUBLISHER_SERIES_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when loading', () => {
      expect(
        selectPublisherSeriesListBusy({
          [PUBLISHER_SERIES_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the series list', () => {
    expect(
      selectPublisherSeriesListEntries({
        [PUBLISHER_SERIES_LIST_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_SERIES_LIST);
  });

  it('should return the total publishers', () => {
    expect(
      selectPublisherSeriesListTotal({
        [PUBLISHER_SERIES_LIST_FEATURE_KEY]: { ...state }
      })
    ).toBe(TEST_TOTAL);
  });
});
