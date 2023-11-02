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
  LAST_READ_LIST_FEATURE_KEY,
  LastReadListState
} from '../reducers/last-read-list.reducer';
import {
  selectLastReadEntries,
  selectLastReadListState,
  selectLastUnreadCount
} from './last-read-list.selectors';
import {
  LAST_READ_1,
  LAST_READ_3,
  LAST_READ_5
} from '@app/comic-books/comic-books.fixtures';

describe('LastReadDates Selectors', () => {
  const ENTRIES = [LAST_READ_1, LAST_READ_3, LAST_READ_5];

  let state: LastReadListState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      unreadCount: Math.floor(Math.random() * 30000),
      entries: ENTRIES
    };
  });

  it('should select the feature state', () => {
    expect(
      selectLastReadListState({
        [LAST_READ_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the last read entries', () => {
    expect(
      selectLastReadEntries({
        [LAST_READ_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });

  it('should select the unread count', () => {
    expect(
      selectLastUnreadCount({
        [LAST_READ_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.unreadCount);
  });
});
