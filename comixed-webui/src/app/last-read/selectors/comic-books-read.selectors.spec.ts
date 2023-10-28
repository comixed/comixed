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
  COMIC_BOOKS_READ_FEATURE_KEY,
  SetComicsReadState
} from '../reducers/comic-books-read.reducer';
import { selectComicBooksReadState } from './comic-books-read.selectors';

describe('ComicBooksRead Selectors', () => {
  let state: SetComicsReadState;

  beforeEach(() => {
    state = { updating: Math.random() > 0.5 };
  });

  it('should select the feature state', () => {
    expect(
      selectComicBooksReadState({
        [COMIC_BOOKS_READ_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
