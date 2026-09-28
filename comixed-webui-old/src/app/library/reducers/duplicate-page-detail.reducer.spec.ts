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
  DuplicatePageDetailState,
  initialState,
  reducer
} from './duplicate-page-detail.reducer';
import { DUPLICATE_PAGE_2 } from '@app/library/library.fixtures';
import {
  duplicatePageDetailLoaded,
  loadDuplicatePageDetail,
  loadDuplicatePageDetailFailed
} from '@app/library/actions/duplicate-page-detail.actions';

describe('DuplicatePageDetail Reducer', () => {
  const DETAIL = DUPLICATE_PAGE_2;

  let state: DuplicatePageDetailState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('an unknown action', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('has no details', () => {
      expect(state.detail).toBeNull();
    });
  });

  describe('loading the detail for a page', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: false,
          detail: DETAIL,
          notFound: true
        },
        loadDuplicatePageDetail({ hash: DETAIL.hash })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('discards any previous detail', () => {
      expect(state.detail).toBeNull();
    });
  });

  describe('receiving the detail for a page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, detail: null },
        duplicatePageDetailLoaded({ detail: DETAIL })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the detail', () => {
      expect(state.detail).toEqual(DETAIL);
    });
  });

  describe('failure to load the detail', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, notFound: false },
        loadDuplicatePageDetailFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the not found flag', () => {
      expect(state.notFound).toBeTrue();
    });
  });
});
