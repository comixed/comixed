/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  LIBRARY_SELECTIONS_FEATURE_KEY,
  LibrarySelectionsState
} from '../reducers/library-selections.reducer';
import {
  selectLibrarySelections,
  selectLibrarySelectionsState
} from './library-selections.selectors';

describe('LibrarySelections Selectors', () => {
  const IDS = [7, 17, 65, 129, 320, 921, 417];
  let state: LibrarySelectionsState;

  beforeEach(() => {
    state = { busy: Math.random() > 0.5, ids: IDS };
  });

  it('should select the feature state', () => {
    expect(
      selectLibrarySelectionsState({
        [LIBRARY_SELECTIONS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select for the selected ids', () => {
    expect(
      selectLibrarySelections({
        [LIBRARY_SELECTIONS_FEATURE_KEY]: state
      })
    ).toEqual(state.ids);
  });
});
