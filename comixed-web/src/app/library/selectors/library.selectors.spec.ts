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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { LIBRARY_FEATURE_KEY, LibraryState } from '../reducers/library.reducer';
import {
  selectAllComics,
  selectComic,
  selectLibraryBusy,
  selectLibraryState
} from './library.selectors';
import { COMIC_1, COMIC_2, COMIC_3 } from '@app/library/library.fixtures';

describe('Library Selectors', () => {
  const COMIC = COMIC_1;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];

  let state: LibraryState;

  beforeEach(() => {
    state = { loading: Math.random() > 0.5, comic: COMIC, comics: COMICS };
  });

  it('selects the feature state', () => {
    expect(
      selectLibraryState({
        [LIBRARY_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the comic', () => {
    expect(
      selectComic({
        [LIBRARY_FEATURE_KEY]: state
      })
    ).toEqual(state.comic);
  });

  it('selects the busy state', () => {
    expect(
      selectLibraryBusy({
        [LIBRARY_FEATURE_KEY]: state
      })
    ).toEqual(state.loading);
  });

  it('selects all comics', () => {
    expect(selectAllComics({ [LIBRARY_FEATURE_KEY]: state })).toEqual(
      state.comics
    );
  });
});
