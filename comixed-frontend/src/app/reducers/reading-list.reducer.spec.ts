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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  initial_state,
  readingListReducer
} from 'app/reducers/reading-list.reducer';
import { ReadingListState } from 'app/models/state/reading-list-state';
import { READING_LIST_1 } from 'app/models/reading-list.fixtures';
import * as ReadingListActions from 'app/actions/reading-list.actions';

describe('readingListReducer', () => {
  let state: ReadingListState;

  beforeEach(() => {
    state = initial_state;
  });

  describe('when creating a new reading list', () => {
    beforeEach(() => {
      state = readingListReducer(
        state,
        new ReadingListActions.ReadingListCreate()
      );
    });

    it('creates an empty reading list', () => {
      expect(state.current_list).toEqual({
        id: null,
        name: '',
        summary: '',
        owner: null,
        entries: []
      });
    });
  });

  describe('when initialized', () => {
    it('does not have the busy flag set', () => {
      expect(state.busy).toBeFalsy();
    });

    it('has an empty array of lists', () => {
      expect(state.reading_lists).toEqual([]);
    });

    it('does not have a current list', () => {
      expect(state.current_list).toBeFalsy();
    });
  });

  describe('when getting the reading lists', () => {
    beforeEach(() => {
      state = readingListReducer(
        state,
        new ReadingListActions.ReadingListGetAll()
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });
  });

  describe('when the reading lists are received', () => {
    beforeEach(() => {
      state = readingListReducer(
        { ...state, busy: true, reading_lists: [] },
        new ReadingListActions.ReadingListGotList({
          reading_lists: [READING_LIST_1]
        })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('sets the reading list', () => {
      expect(state.reading_lists).toEqual([READING_LIST_1]);
    });
  });

  describe('when getting the reading lists fails', () => {
    beforeEach(() => {
      state = readingListReducer(
        { ...state, busy: true },
        new ReadingListActions.ReadingListGetFailed()
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });

  describe('when setting the current list', () => {
    beforeEach(() => {
      state = readingListReducer(
        state,
        new ReadingListActions.ReadingListSetCurrent({
          reading_list: READING_LIST_1
        })
      );
    });

    it('sets the list', () => {
      expect(state.current_list).toEqual(READING_LIST_1);
    });
  });

  describe('when saving a reading list', () => {
    beforeEach(() => {
      state = readingListReducer(
        state,
        new ReadingListActions.ReadingListSave({ reading_list: READING_LIST_1 })
      );
    });

    it('sets the busy state', () => {
      expect(state.busy).toBeTruthy();
    });
  });

  describe('when a reading list is saved', () => {
    beforeEach(() => {
      state = readingListReducer(
        { ...state, busy: true, reading_lists: [] },
        new ReadingListActions.ReadingListSaved({
          reading_list: READING_LIST_1
        })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('adds the reading list', () => {
      expect(state.reading_lists).toEqual([READING_LIST_1]);
    });

    it('sets the current reading list', () => {
      expect(state.current_list).toEqual(READING_LIST_1);
    });
  });

  describe('when a reading list fails to save', () => {
    beforeEach(() => {
      state = readingListReducer(
        { ...state, busy: true, reading_lists: [] },
        new ReadingListActions.ReadingListSaveFailed()
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });
});
