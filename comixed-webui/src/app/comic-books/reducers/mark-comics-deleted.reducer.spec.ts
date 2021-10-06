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
  MarkComicsDeletedState,
  initialState,
  reducer
} from './mark-comics-deleted.reducer';
import {
  comicsMarkedDeleted,
  markComicsDeleted,
  markComicsDeletedFailed
} from '@app/comic-books/actions/mark-comics-deleted.actions';
import { COMIC_1 } from '@app/comic-books/comic-books.fixtures';

describe('MarkComicsDeleted Reducer', () => {
  const COMIC = COMIC_1;
  const DELETED = Math.random() > 0.5;

  let state: MarkComicsDeletedState;

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

  describe('setting the deleted state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        markComicsDeleted({ comics: [COMIC], deleted: DELETED })
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('success setting the state', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: true }, comicsMarkedDeleted());
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('failure setting the state', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: true }, markComicsDeletedFailed());
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });
});
