/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  LibrarySelectionsState,
  reducer
} from './library-selections.reducer';
import {
  clearSelectedComicBooks,
  comicBookSelectionsUpdated,
  deselectComicBooks,
  selectComicBooks,
  updateComicBookSelectionsFailed
} from '@app/library/actions/library-selections.actions';

describe('LibrarySelections Reducer', () => {
  const IDS = [7, 17, 65, 129, 320, 921, 417];

  let state: LibrarySelectionsState;

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

    it('has no selections', () => {
      expect(state.ids).toEqual([]);
    });
  });

  describe('selecting comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        selectComicBooks({ ids: IDS })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('deselecting comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        deselectComicBooks({ ids: IDS })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('clear comic book selections', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, clearSelectedComicBooks());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('successfully updating comic book selections', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, ids: [IDS[1]] },
        comicBookSelectionsUpdated({ ids: IDS })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('updates the list of selected ids', () => {
      expect(state.ids).toEqual(IDS);
    });
  });

  describe('null comic book selections update', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, ids: IDS },
        comicBookSelectionsUpdated({ ids: null })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('leaves the list of selected ids intact', () => {
      expect(state.ids).toEqual(IDS);
    });
  });

  describe('failed to update comic book selections', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true },
        updateComicBookSelectionsFailed()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
