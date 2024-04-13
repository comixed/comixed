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
  IMPORT_COMIC_BOOKS_FEATURE_KEY,
  ImportComicBooksState
} from '../reducers/import-comic-books.reducer';
import {
  selectAddingComicBooksState,
  selectImportingComicBooksState,
  selectProcessingComicBooksState
} from './import-comic-books.selectors';

describe('ImportComicBooks Selectors', () => {
  let state: ImportComicBooksState;

  beforeEach(() => {
    state = {
      adding: {
        active: Math.random() > 0.5,
        started: new Date().getTime(),
        total: Math.abs(Math.floor(Math.random() * 1000)),
        processed: Math.abs(Math.floor(Math.random() * 1000))
      },
      processing: {
        active: Math.random() > 0.5,
        started: new Date().getTime(),
        stepName: 'step-name',
        total: Math.abs(Math.floor(Math.random() * 1000)),
        processed: Math.abs(Math.floor(Math.random() * 1000))
      }
    };
  });

  it('should select the feature state', () => {
    expect(
      selectImportingComicBooksState({
        [IMPORT_COMIC_BOOKS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the adding comic books state', () => {
    expect(
      selectAddingComicBooksState({
        [IMPORT_COMIC_BOOKS_FEATURE_KEY]: state
      })
    ).toEqual(state.adding);
  });

  it('should select the processing comic books state', () => {
    expect(
      selectProcessingComicBooksState({
        [IMPORT_COMIC_BOOKS_FEATURE_KEY]: state
      })
    ).toEqual(state.processing);
  });
});
