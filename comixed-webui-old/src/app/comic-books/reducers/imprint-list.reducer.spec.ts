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
  ImprintListState,
  initialState,
  reducer
} from './imprint-list.reducer';
import {
  IMPRINT_1,
  IMPRINT_2,
  IMPRINT_3
} from '@app/comic-books/comic-books.fixtures';
import {
  imprintsLoaded,
  loadImprints,
  loadImprintsFailed
} from '@app/comic-books/actions/imprint-list.actions';

describe('ImprintList Reducer', () => {
  const ENTRIES = [IMPRINT_1, IMPRINT_2, IMPRINT_3];

  let state: ImprintListState;

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

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('loading the imprint list', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadImprints());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving the imprint list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entries: [] },
        imprintsLoaded({ entries: ENTRIES })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the imprint entries', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('failure to load the imprint list', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadImprintsFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });
});
