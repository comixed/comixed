/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  DuplicateComicState,
  initialState,
  reducer
} from './duplicate-comic.reducer';
import {
  loadDuplicateComics,
  loadDuplicateComicsFailure,
  loadDuplicateComicsSuccess
} from '@app/library/actions/duplicate-comic.actions';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2,
  DUPLICATE_COMIC_3,
  DUPLICATE_COMIC_4,
  DUPLICATE_COMIC_5
} from '@app/library/library.fixtures';

describe('DuplicateComic Reducer', () => {
  const DUPLICATE_COMIC_LIST = [
    DUPLICATE_COMIC_1,
    DUPLICATE_COMIC_2,
    DUPLICATE_COMIC_3,
    DUPLICATE_COMIC_4,
    DUPLICATE_COMIC_5
  ];
  const PAGE_SIZE = 25;
  const PAGE_INDEX = 4;
  const SORT_BY = '';
  const SORT_DIRECTION = '';

  let state: DuplicateComicState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('this initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('has a zero total', () => {
      expect(state.total).toEqual(0);
    });
  });

  describe('loading a page of duplicate comics', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          busy: false
        },
        loadDuplicateComics({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true,
            entries: [],
            total: 0
          },
          loadDuplicateComicsSuccess({
            entries: DUPLICATE_COMIC_LIST,
            total: DUPLICATE_COMIC_LIST.length
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the entries', () => {
        expect(state.entries).toEqual(DUPLICATE_COMIC_LIST);
      });

      it('sets the total', () => {
        expect(state.total).toEqual(DUPLICATE_COMIC_LIST.length);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true,
            entries: [],
            total: 0
          },
          loadDuplicateComicsFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
