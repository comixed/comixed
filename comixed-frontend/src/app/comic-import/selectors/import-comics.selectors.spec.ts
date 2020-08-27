/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import {
  IMPORT_COMICS_FEATURE_KEY,
  ImportComicsState
} from '../reducers/import-comics.reducer';
import {
  selectImportComicsStarting,
  selectImportComicsState
} from './import-comics.selectors';

describe('ImportComics Selectors', () => {
  let state: ImportComicsState;

  beforeEach(() => {
    state = { starting: Math.random() * 100 > 50 } as ImportComicsState;
  });

  it('selects the feature state', () => {
    expect(
      selectImportComicsState({
        [IMPORT_COMICS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the starting flag', () => {
    expect(
      selectImportComicsStarting({ [IMPORT_COMICS_FEATURE_KEY]: state })
    ).toEqual(state.starting);
  });
});
