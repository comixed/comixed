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
  READ_COMICS_FEATURE_KEY,
  ReadComicsState
} from '../reducers/read-comics.reducer';
import { selectReadComicBooksList } from './read-comic-books.selectors';

import {
  READ_COMIC_1,
  READ_COMIC_2,
  READ_COMIC_3,
  READ_COMIC_4,
  READ_COMIC_5
} from '@app/user/user.fixtures';

describe('ReadComicBooks Selectors', () => {
  const READ_COMICS = [
    READ_COMIC_1,
    READ_COMIC_2,
    READ_COMIC_3,
    READ_COMIC_4,
    READ_COMIC_5
  ];

  let state: ReadComicsState;

  beforeEach(() => {
    state = { entries: READ_COMICS };
  });

  it('returns the list of read comic book ids', () => {
    expect(
      selectReadComicBooksList({
        [READ_COMICS_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
