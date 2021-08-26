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
  READING_LIST_DETAIL_FEATURE_KEY,
  ReadingListDetailState
} from '../reducers/reading-list-detail.reducer';
import {
  selectReadingList,
  selectReadingListState
} from './reading-list-detail.selectors';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';

describe('LoadReadingList Selectors', () => {
  const READING_LIST = READING_LIST_3;

  let state: ReadingListDetailState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      notFound: Math.random() > 0.5,
      list: READING_LIST,
      saving: Math.random() > 0.5
    };
  });

  it('should select the feature state', () => {
    expect(
      selectReadingListState({
        [READING_LIST_DETAIL_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the reading list', () => {
    expect(
      selectReadingList({
        [READING_LIST_DETAIL_FEATURE_KEY]: state
      })
    ).toEqual(state.list);
  });
});
