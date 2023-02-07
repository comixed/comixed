/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  DELETED_PAGE_FEATURE_KEY,
  DeletedPagesState
} from '../reducers/deleted-pages.reducer';
import {
  selectDeletedPage,
  selectDeletedPageList,
  selectDeletedPagesState
} from './deleted-pages.selectors';
import {
  DELETED_PAGE_1,
  DELETED_PAGE_2,
  DELETED_PAGE_3,
  DELETED_PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';

describe('DeletedPages Selectors', () => {
  const DELETED_PAGE_LIST = [
    DELETED_PAGE_1,
    DELETED_PAGE_2,
    DELETED_PAGE_3,
    DELETED_PAGE_4
  ];

  let state: DeletedPagesState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      list: DELETED_PAGE_LIST,
      current: DELETED_PAGE_LIST[0]
    };
  });

  it('should select the feature state', () => {
    expect(
      selectDeletedPagesState({
        [DELETED_PAGE_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should return the list of deleted pages', () => {
    expect(
      selectDeletedPageList({ [DELETED_PAGE_FEATURE_KEY]: state })
    ).toEqual(state.list);
  });

  it('should return the current deleted page', () => {
    expect(selectDeletedPage({ [DELETED_PAGE_FEATURE_KEY]: state })).toEqual(
      state.current
    );
  });
});
