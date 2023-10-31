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
  initialState,
  reducer,
  UpdateMetadataState
} from './update-metadata.reducer';
import {
  updateSelectedComicBooksMetadata,
  updateSelectedComicBooksMetadataFailure,
  updateSelectedComicBooksMetadataSuccess,
  updateSingleComicBookMetadata
} from '@app/library/actions/update-metadata.actions';
import { COMIC_DETAIL_1 } from '@app/comic-books/comic-books.fixtures';

describe('UpdateMetadata Reducer', () => {
  const COMIC_DETAIL = COMIC_DETAIL_1;

  let state: UpdateMetadataState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('updating a single comic book', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        updateSingleComicBookMetadata({ comicBookId: COMIC_DETAIL.comicId })
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('updating selected comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        updateSelectedComicBooksMetadata()
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('success updating a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: true },
        updateSelectedComicBooksMetadataSuccess()
      );
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('failure updating a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: true },
        updateSelectedComicBooksMetadataFailure()
      );
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });
});
