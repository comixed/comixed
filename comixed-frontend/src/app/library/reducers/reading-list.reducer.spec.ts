/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import {
  initialState,
  ReadingListState,
  reducer
} from './reading-list.reducer';
import {
  ReadingListCancelEdit,
  ReadingListCreate,
  ReadingListEdit,
  ReadingListSave,
  ReadingListSaved,
  ReadingListSaveFailed
} from 'app/library/actions/reading-list.actions';
import { READING_LIST_1 } from 'app/comics/models/reading-list.fixtures';

describe('ReadingList Reducer', () => {
  const READING_LIST = READING_LIST_1;

  let state: ReadingListState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('does not have a current list', () => {
      expect(state.current).toBeNull();
    });

    it('clears the editing reading list flag', () => {
      expect(state.editingList).toBeFalsy();
    });

    it('clears the saving reading list flag', () => {
      expect(state.savingList).toBeFalsy();
    });
  });

  describe('creating a new reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current: null, editingList: false },
        new ReadingListCreate()
      );
    });

    it('sets a default reading list as the current one', () => {
      expect(state.current).not.toBeNull();
    });

    it('sets the editing list flag', () => {
      expect(state.editingList).toBeTruthy();
    });

    it('clears the saving flag', () => {
      expect(state.savingList).toBeFalsy();
    });
  });

  describe('editing a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current: null, editingList: false, savingList: true },
        new ReadingListEdit({ readingList: READING_LIST })
      );
    });

    it('sets a default reading list as the current one', () => {
      expect(state.current).toEqual(READING_LIST);
    });

    it('sets the editing list flag', () => {
      expect(state.editingList).toBeTruthy();
    });

    it('clears the saving flag', () => {
      expect(state.savingList).toBeFalsy();
    });
  });

  describe('canceling editing a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current: READING_LIST, editingList: true },
        new ReadingListCancelEdit()
      );
    });

    it('clears the current reading list', () => {
      expect(state.current).toBeNull();
    });

    it('clears the editing list flag', () => {
      expect(state.editingList).toBeFalsy();
    });
  });

  describe('when saving a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, savingList: false },
        new ReadingListSave({
          id: READING_LIST.id,
          name: READING_LIST.name,
          summary: READING_LIST.summary
        })
      );
    });

    it('sets the saving flag', () => {
      expect(state.savingList).toBeTruthy();
    });

    it('clears the editing flag', () => {
      expect(state.editingList).toBeFalsy();
    });
  });

  describe('when the reading list is saved', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          savingList: true,
          editingList: true,
          current: null
        },
        new ReadingListSaved({ readingList: READING_LIST })
      );
    });

    it('clears the saving reading list flag', () => {
      expect(state.savingList).toBeFalsy();
    });

    it('clears the editing reading list failed flag', () => {
      expect(state.editingList).toBeFalsy();
    });

    it('sets the reading list', () => {
      expect(state.current).toEqual(READING_LIST);
    });
  });

  describe('when saving the reading list fails', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          savingList: true
        },
        new ReadingListSaveFailed()
      );
    });

    it('clears the saving reading list flag', () => {
      expect(state.savingList).toBeFalsy();
    });
  });
});
