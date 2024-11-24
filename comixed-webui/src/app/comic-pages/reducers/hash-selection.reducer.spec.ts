/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  HashSelectionState,
  initialState,
  reducer
} from './hash-selection.reducer';
import { PAGE_1, PAGE_2, PAGE_3 } from '@app/comic-pages/comic-pages.fixtures';
import {
  addAllHashesToSelection,
  addHashSelection,
  clearHashSelections,
  loadHashSelections,
  loadHashSelectionsFailure,
  loadHashSelectionsSuccess,
  removeHashSelection
} from '@app/comic-pages/actions/hash-selection.actions';

describe('HashSelection Reducer', () => {
  const HASHES = [PAGE_1.hash, PAGE_2.hash, PAGE_3.hash];
  const HASH = HASHES[0];

  let state: HashSelectionState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('loading selected hashes', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadHashSelections());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('adding all duplicate hashes', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: false }, addAllHashesToSelection());
      });

      it('sets the busy flag', () => {
        expect(state.busy).toBeTrue();
      });
    });

    describe('adding selected hashes', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: false },
          addHashSelection({ hash: HASH })
        );
      });

      it('sets the busy flag', () => {
        expect(state.busy).toBeTrue();
      });
    });

    describe('removing selected hashes', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: false },
          removeHashSelection({ hash: HASH })
        );
      });

      it('sets the busy flag', () => {
        expect(state.busy).toBeTrue();
      });
    });

    describe('clearing the selected hash state', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: false }, clearHashSelections());
      });

      it('sets the busy flag', () => {
        expect(state.busy).toBeTrue();
      });
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          loadHashSelectionsSuccess({ entries: HASHES })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('updates the hash list', () => {
        expect(state.entries).toEqual(HASHES);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: HASHES },
          loadHashSelectionsFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('does not alter the entries', () => {
        expect(state.entries).toEqual(HASHES);
      });
    });
  });
});
