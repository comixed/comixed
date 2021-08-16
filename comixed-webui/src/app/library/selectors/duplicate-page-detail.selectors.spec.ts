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
  DUPLICATE_PAGE_DETAIL_FEATURE_KEY,
  DuplicatePageDetailState
} from '../reducers/duplicate-page-detail.reducer';
import {
  selectDuplicatePageDetail,
  selectDuplicatePageDetailState
} from './duplicate-page-detail.selectors';
import { DUPLICATE_PAGE_3 } from '@app/library/library.fixtures';

describe('DuplicatePageDetail Selectors', () => {
  let state: DuplicatePageDetailState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      notFound: Math.random() > 0.5,
      detail: DUPLICATE_PAGE_3
    };
  });

  it('should select the feature state', () => {
    expect(
      selectDuplicatePageDetailState({
        [DUPLICATE_PAGE_DETAIL_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the duplicate page detail', () => {
    expect(
      selectDuplicatePageDetail({
        [DUPLICATE_PAGE_DETAIL_FEATURE_KEY]: state
      })
    ).toEqual(state.detail);
  });
});
