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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  initial_state,
  ReadingListState,
  reducer
} from './reading-list.reducer';
import {
  ReadingListCreate,
  ReadingListGet,
  ReadingListGetFailed,
  ReadingListLoadFailed,
  ReadingListReceived,
  ReadingListSave,
  ReadingListSaved,
  ReadingListSaveFailed,
  ReadingListsLoad,
  ReadingListsLoaded
} from 'app/library/actions/reading-list.actions';
import { READING_LIST_1 } from 'app/library/models/reading-list/reading-list.fixtures';
import { ReadingList } from 'app/library';

describe('ReadingList Reducer', () => {
  const READING_LISTS = [READING_LIST_1];

  let state: ReadingListState;

  beforeEach(() => {
    state = initial_state;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the loading reading lists flag', () => {
      expect(state.fetching_lists).toBeFalsy();
    });

    it('has an empty set of reading lists', () => {
      expect(state.reading_lists).toEqual([]);
    });

    it('clears the fetching list flag', () => {
      expect(state.fetching_list).toBeFalsy();
    });

    it('does not have a current list', () => {
      expect(state.current_list).toBeNull();
    });

    it('clears the saving reading list flag', () => {
      expect(state.saving_reading_list).toBeFalsy();
    });

    it('clears the saving failed flag', () => {
      expect(state.saving_reading_list_failed).toBeFalsy();
    });
  });

  describe('getting the set of reading lists', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_lists: false },
        new ReadingListsLoad()
      );
    });

    it('sets the loading reading lists flag', () => {
      expect(state.fetching_lists).toBeTruthy();
    });
  });

  describe('when the reading lists are received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_lists: true, reading_lists: [] },
        new ReadingListsLoaded({ reading_lists: READING_LISTS })
      );
    });

    it('clears the fetching lists flag', () => {
      expect(state.fetching_lists).toBeFalsy();
    });

    it('sets the reading lists', () => {
      expect(state.reading_lists).toEqual(READING_LISTS);
    });
  });

  describe('when getting the reading lists failed', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_lists: true },
        new ReadingListLoadFailed()
      );
    });

    it('clears the fetching lists flag', () => {
      expect(state.fetching_lists).toBeFalsy();
    });
  });

  describe('when getting a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_list: false },
        new ReadingListGet({ id: READING_LIST_1.id })
      );
    });

    it('sets the fetching list flag', () => {
      expect(state.fetching_list).toBeTruthy();
    });
  });

  describe('when the reading list is received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_list: true, current_list: null },
        new ReadingListReceived({ reading_list: READING_LIST_1 })
      );
    });

    it('clears the fetching list flag', () => {
      expect(state.fetching_list).toBeFalsy();
    });

    it('sets the current list', () => {
      expect(state.current_list).toEqual(READING_LIST_1);
    });
  });

  describe('when getting the reading list fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_list: true },
        new ReadingListGetFailed()
      );
    });

    it('clears the fetching list flag', () => {
      expect(state.fetching_list).toBeFalsy();
    });
  });

  describe('when creating a new reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current_list: READING_LIST_1 },
        new ReadingListCreate()
      );
    });

    it('sets a default reading list as the current one', () => {
      expect(state.current_list).toEqual({} as ReadingList);
    });
  });

  describe('when saving a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving_reading_list: false },
        new ReadingListSave({ reading_list: READING_LIST_1 })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving_reading_list).toBeTruthy();
    });
  });

  describe('when the reading list is saved', () => {
    const UPDATED_LIST = {
      ...READING_LISTS[0],
      summary: 'This is the updated summary'
    };

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          reading_lists: READING_LISTS,
          saving_reading_list: true,
          saving_reading_list_failed: true,
          current_list: null
        },
        new ReadingListSaved({ reading_list: UPDATED_LIST })
      );
    });

    it('clears the saving reading list flag', () => {
      expect(state.saving_reading_list).toBeFalsy();
    });

    it('clears the saving reading list failed flag', () => {
      expect(state.saving_reading_list_failed).toBeFalsy();
    });

    it('replaces the list in the set', () => {
      expect(state.reading_lists).not.toContain(READING_LISTS[0]);
      expect(state.reading_lists).toContain(UPDATED_LIST);
    });

    it('sets the reading list', () => {
      expect(state.current_list).toEqual(UPDATED_LIST);
    });
  });

  describe('when saving the reading list fails', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          saving_reading_list: true,
          saving_reading_list_failed: false
        },
        new ReadingListSaveFailed()
      );
    });

    it('clears the saving reading list flag', () => {
      expect(state.saving_reading_list).toBeFalsy();
    });

    it('sets the saving reading list failed flag', () => {
      expect(state.saving_reading_list_failed).toBeTruthy();
    });
  });
});
