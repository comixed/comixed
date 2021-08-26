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
  initialState,
  ReadingListDetailState,
  reducer
} from './reading-list-detail.reducer';
import {
  createReadingList,
  loadReadingList,
  loadReadingListFailed,
  readingListLoaded,
  readingListSaved,
  saveReadingList,
  saveReadingListFailed
} from '@app/lists/actions/reading-list-detail.actions';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import { READING_LIST_TEMPLATE } from '@app/lists/lists.constants';

describe('LoadReadingList Reducer', () => {
  const READING_LIST = READING_LIST_3;

  let state: ReadingListDetailState;

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

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('has no reading list', () => {
      expect(state.list).toBeNull();
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('creating a new reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, notFound: true, list: null },
        createReadingList()
      );
    });

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('loads a default reading list', () => {
      expect(state.list).toEqual(READING_LIST_TEMPLATE);
    });
  });

  describe('loading a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false, notFound: true, list: READING_LIST },
        loadReadingList({ id: READING_LIST.id })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('clears the current reading list', () => {
      expect(state.list).toBeNull();
    });
  });

  describe('loading success', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, list: null },
        readingListLoaded({ list: READING_LIST })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the reading list', () => {
      expect(state.list).toEqual(READING_LIST);
    });
  });

  describe('loading failure', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, notFound: false },
        loadReadingListFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the not loaded flag', () => {
      expect(state.notFound).toBeTrue();
    });
  });

  describe('saving a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        saveReadingList({ list: READING_LIST })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });
  });

  describe('saving success', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: true, list: null },
        readingListSaved({ list: READING_LIST })
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('updates the reading list', () => {
      expect(state.list).toEqual(READING_LIST);
    });
  });

  describe('saving failure', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, saveReadingListFailed());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });
});
