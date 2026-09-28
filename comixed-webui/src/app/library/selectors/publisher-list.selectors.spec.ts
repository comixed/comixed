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
import { PUBLISHER_1 } from '@app/library/library-fixtures';
import {
  initialPublisherListState,
  PUBLISHER_LIST_FEATURE_KEY,
  publisherListAdaptor,
  PublisherListState
} from '@app/library/reducers/publisher-list.reducer';
import {
  selectPublisherList,
  selectPublisherListLoading,
  selectPublisherListTotal
} from '@app/library/selectors/publisher-list.selectors';

describe('PublisherList Selectors', () => {
  const TEST_PUBLISHER_LIST = [PUBLISHER_1];
  const TEST_TOTAL = 320;

  let state: PublisherListState;

  beforeEach(() => {
    state = publisherListAdaptor.setAll(TEST_PUBLISHER_LIST, {
      ...initialPublisherListState,
      total: TEST_TOTAL,
      loading: false
    });
  });

  describe('selecting the loading flag', () => {
    it('returns false when loading', () => {
      expect(
        selectPublisherListLoading({
          [PUBLISHER_LIST_FEATURE_KEY]: { ...state, loading: false }
        })
      ).toBeFalsy();
    });

    it('returns true when loading', () => {
      expect(
        selectPublisherListLoading({
          [PUBLISHER_LIST_FEATURE_KEY]: { ...state, loading: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the publisher list', () => {
    expect(
      selectPublisherList({ [PUBLISHER_LIST_FEATURE_KEY]: { ...state } })
    ).toStrictEqual(TEST_PUBLISHER_LIST);
  });

  it('should return the total publishers', () => {
    expect(
      selectPublisherListTotal({ [PUBLISHER_LIST_FEATURE_KEY]: { ...state } })
    ).toBe(TEST_TOTAL);
  });
});
