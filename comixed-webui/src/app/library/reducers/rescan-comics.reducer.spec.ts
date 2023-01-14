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
  RescanComicsState
} from './rescan-comics.reducer';
import {
  comicsRescanning,
  rescanComics,
  rescanComicsFailed
} from '@app/library/actions/rescan-comics.actions';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';

describe('RescanComics Reducer', () => {
  const COMICS = [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5];

  let state: RescanComicsState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalse();
    });
  });

  describe('starting the process', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, working: false },
        rescanComics({ comicBooks: COMICS })
      );
    });

    it('sets the working flag', () => {
      expect(state.working).toBeTrue();
    });
  });

  describe('success', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: true }, comicsRescanning());
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalse();
    });
  });

  describe('failure', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: true }, rescanComicsFailed());
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalse();
    });
  });
});
