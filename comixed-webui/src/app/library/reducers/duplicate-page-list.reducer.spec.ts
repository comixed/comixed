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
  DuplicatePageListState,
  initialState,
  reducer
} from './duplicate-page-list.reducer';
import {
  loadDuplicatePageList,
  loadDuplicatePageListFailure,
  loadDuplicatePageListSuccess,
  resetDuplicatePages
} from '@app/library/actions/duplicate-page-list.actions';
import {
  DUPLICATE_PAGE_1,
  DUPLICATE_PAGE_2,
  DUPLICATE_PAGE_3
} from '@app/library/library.fixtures';

describe('DuplicatePageList Reducer', () => {
  const PAGE_NUMBER = 7;
  const PAGE_SIZE = 10;
  const SORT_FIELD = 'hash';
  const SORT_DIRECTION = 'desc';
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2, DUPLICATE_PAGE_3];
  const TOTAL_PAGES = PAGES.length;

  let state: DuplicatePageListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('has no total pages', () => {
      expect(state.total).toEqual(0);
    });

    it('has no pages', () => {
      expect(state.pages).toEqual([]);
    });
  });

  describe('resetting the feature state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, total: TOTAL_PAGES, pages: PAGES },
        resetDuplicatePages()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('has no total pages', () => {
      expect(state.total).toEqual(0);
    });

    it('clears the pages', () => {
      expect(state.pages).toEqual([]);
    });
  });

  describe('loading the pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadDuplicatePageList({
          page: PAGE_NUMBER,
          size: PAGE_SIZE,
          sortBy: SORT_FIELD,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true, total: 0, pages: [] },
          loadDuplicatePageListSuccess({
            pages: PAGES,
            totalPages: TOTAL_PAGES
          })
        );
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });

      it('sets the total pages', () => {
        expect(state.total).toEqual(TOTAL_PAGES);
      });

      it('loads the pages', () => {
        expect(state.pages).toEqual(PAGES);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true },
          loadDuplicatePageListFailure()
        );
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });
    });
  });
});
