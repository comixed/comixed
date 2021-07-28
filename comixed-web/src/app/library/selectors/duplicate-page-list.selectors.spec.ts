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
  DUPLICATE_PAGE_LIST_FEATURE_KEY,
  DuplicatePageListState
} from '../reducers/duplicate-page-list.reducer';
import {
  selectDuplicatePageList,
  selectDuplicatePageListState
} from './duplicate-page-list.selectors';
import {
  DUPLICATE_PAGE_1,
  DUPLICATE_PAGE_2,
  DUPLICATE_PAGE_3
} from '@app/library/library.fixtures';

describe('DuplicatePageList Selectors', () => {
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2, DUPLICATE_PAGE_3];

  let state: DuplicatePageListState;

  beforeEach(() => {
    state = { loading: Math.random() > 0.5, pages: PAGES };
  });

  it('should select the feature state', () => {
    expect(
      selectDuplicatePageListState({
        [DUPLICATE_PAGE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the page list', () => {
    expect(
      selectDuplicatePageList({
        [DUPLICATE_PAGE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.pages);
  });
});
