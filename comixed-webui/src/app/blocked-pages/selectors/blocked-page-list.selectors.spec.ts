/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import {
  BLOCKED_PAGE_LIST_FEATURE_KEY,
  BlockedPageListState
} from '../reducers/blocked-page-list.reducer';
import {
  selectBlockedPageList,
  selectBlockedPageListState
} from './blocked-page-list.selectors';
import {
  BLOCKED_PAGE_1,
  BLOCKED_PAGE_3,
  BLOCKED_PAGE_5
} from '@app/blocked-pages/blocked-pages.fixtures';

describe('BlockedPageList Selectors', () => {
  const ENTRIES = [BLOCKED_PAGE_1, BLOCKED_PAGE_3, BLOCKED_PAGE_5];

  let state: BlockedPageListState;

  beforeEach(() => {
    state = { loading: Math.random() > 0.5, entries: ENTRIES };
  });

  it('should select the feature state', () => {
    expect(
      selectBlockedPageListState({
        [BLOCKED_PAGE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of blocked pages', () => {
    expect(
      selectBlockedPageList({
        [BLOCKED_PAGE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
