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
  READING_LISTS_FEATURE_KEY,
  ReadingListsState
} from '../reducers/reading-lists.reducer';
import {
  selectUserReadingListsState,
  selectUserReadingLists
} from './reading-lists.selectors';
import {
  READING_LIST_1,
  READING_LIST_3,
  READING_LIST_5
} from '@app/lists/lists.fixtures';

describe('ReadingLists Selectors', () => {
  const READING_LISTS = [READING_LIST_1, READING_LIST_3, READING_LIST_5];

  let state: ReadingListsState;

  beforeEach(() => {
    state = { loading: Math.random() > 0.5, entries: READING_LISTS };
  });

  it('should select the feature state', () => {
    expect(
      selectUserReadingListsState({
        [READING_LISTS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the reading lists', () => {
    expect(
      selectUserReadingLists({
        [READING_LISTS_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
