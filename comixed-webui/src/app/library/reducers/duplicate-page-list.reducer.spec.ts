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
  duplicatePagesLoaded,
  loadDuplicatePages,
  loadDuplicatePagesFailed,
  resetDuplicatePages
} from '@app/library/actions/duplicate-page-list.actions';
import {
  DUPLICATE_PAGE_1,
  DUPLICATE_PAGE_2,
  DUPLICATE_PAGE_3
} from '@app/library/library.fixtures';

describe('DuplicatePageList Reducer', () => {
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2, DUPLICATE_PAGE_3];

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

    it('has no pages', () => {
      expect(state.pages).toEqual([]);
    });
  });

  describe('resetting the feature state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, pages: PAGES },
        resetDuplicatePages()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('clears the pages', () => {
      expect(state.pages).toEqual([]);
    });
  });

  describe('loading the pages', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadDuplicatePages());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('success loading the pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, pages: [] },
        duplicatePagesLoaded({ pages: PAGES })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('loads the pages', () => {
      expect(state.pages).toEqual(PAGES);
    });
  });

  describe('failure loading the pages', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadDuplicatePagesFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });
});
