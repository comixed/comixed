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
  BLOCKED_PAGE_DETAIL_FEATURE_KEY,
  BlockedPageDetailState
} from '../reducers/blocked-page-detail.reducer';
import {
  selectBlockedPageDetail,
  selectBlockedPageDetailState
} from './blocked-page-detail.selectors';
import { BLOCKED_PAGE_4 } from '@app/blocked-pages/blocked-pages.fixtures';

describe('BlockedPage Selectors', () => {
  const ENTRY = BLOCKED_PAGE_4;

  let state: BlockedPageDetailState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      notFound: Math.random() > 0.5,
      entry: ENTRY,
      saving: Math.random() > 0.5,
      saved: Math.random() > 0.5
    };
  });

  it('should select the feature state', () => {
    expect(
      selectBlockedPageDetailState({
        [BLOCKED_PAGE_DETAIL_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the blocked page detail', () => {
    expect(
      selectBlockedPageDetail({
        [BLOCKED_PAGE_DETAIL_FEATURE_KEY]: state
      })
    ).toEqual(state.entry);
  });
});
