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
import { selectLibraryState, selectSelectedComics } from './library.selectors';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3
} from '@app/comic-books/comic-books.fixtures';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';

describe('Library Selectors', () => {
  const SELECTED_COMICS = [COMIC_BOOK_1, COMIC_BOOK_2, COMIC_BOOK_3];

  let state: LibraryState;

  beforeEach(() => {
    state = {
      selected: SELECTED_COMICS,
      busy: Math.random() > 0.5,
      totalComics: Math.abs(Math.random() * 100),
      deletedComics: Math.abs(Math.random() * 100),
      publishers: [{ name: 'Publisher1', count: 1 }],
      series: [{ name: 'Series1', count: 1 }],
      characters: [{ name: 'Character1', count: 1 }],
      teams: [{ name: 'Team1', count: 1 }],
      locations: [{ name: 'Location1', count: 1 }],
      stories: [{ name: 'Story1', count: 1 }],
      states: [{ name: ComicBookState.CHANGED.toString(), count: 1 }]
    };
  });

  it('selects the feature state', () => {
    expect(
      selectLibraryState({
        [LIBRARY_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the selected comics', () => {
    expect(selectSelectedComics({ [LIBRARY_FEATURE_KEY]: state })).toEqual(
      SELECTED_COMICS
    );
  });
});
