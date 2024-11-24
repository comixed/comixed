/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  HASH_SELECTION_FEATURE_KEY,
  HashSelectionState
} from '../reducers/hash-selection.reducer';
import { PAGE_1, PAGE_2, PAGE_3 } from '@app/comic-pages/comic-pages.fixtures';
import {
  selectHashSelectionList,
  selectHashSelectionState
} from '@app/comic-pages/selectors/hash-selection.selectors';

describe('HashSelection Selectors', () => {
  const HASHES = [PAGE_1.hash, PAGE_2.hash, PAGE_3.hash];

  let state: HashSelectionState;

  beforeEach(() => {
    state = { ...state, entries: HASHES, busy: Math.random() > 0.5 };
  });

  it('should select the feature state', () => {
    expect(
      selectHashSelectionState({
        [HASH_SELECTION_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the selected hash list', () => {
    expect(
      selectHashSelectionList({
        [HASH_SELECTION_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
