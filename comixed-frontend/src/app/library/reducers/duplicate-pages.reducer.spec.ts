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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import {
  reducer,
  initialState,
  DuplicatePagesState
} from './duplicate-pages.reducer';
import {
  DuplicatePagesAllReceived,
  DuplicatePagesBlockingSet,
  DuplicatePagesDeletedSet,
  DuplicatePagesDeselect,
  DuplicatePagesGetAll,
  DuplicatePagesGetAllFailed,
  DuplicatePagesSelect,
  DuplicatePagesSetBlocking,
  DuplicatePagesSetBlockingFailed,
  DuplicatePagesSetDeleted,
  DuplicatePagesSetDeletedFailed
} from 'app/library/actions/duplicate-pages.actions';
import { DUPLICATE_PAGE_1 } from 'app/library/library.fixtures';
import { DUPLICATE_PAGE_2 } from 'app/library/models/duplicate-page.fixtures';
import { DuplicatePage } from 'app/library/models/duplicate-page';

describe('DuplicatePages Reducer', () => {
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2];

  let state: DuplicatePagesState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching all flag', () => {
      expect(state.fetchingAll).toBeFalsy();
    });

    it('has an empty set of pages', () => {
      expect(state.pages).toEqual([]);
    });

    it('has an empty select of selected pages', () => {
      expect(state.selected).toEqual([]);
    });

    it('clears the set blocking flag', () => {
      expect(state.setBlocking).toBeFalsy();
    });

    it('clears the set deleted flag', () => {
      expect(state.setDeleted).toBeFalsy();
    });
  });

  describe('fetching the duplicate pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingAll: false },
        new DuplicatePagesGetAll()
      );
    });

    it('sets the fetching all flag', () => {
      expect(state.fetchingAll).toBeTruthy();
    });
  });

  describe('receiving the duplicate pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingAll: true, pages: [] },
        new DuplicatePagesAllReceived({ pages: PAGES })
      );
    });

    it('clears the fetching all flag', () => {
      expect(state.fetchingAll).toBeFalsy();
    });

    it('sets the pages', () => {
      expect(state.pages).toEqual(PAGES);
    });
  });

  describe('failing to get the duplicate pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingAll: true },
        new DuplicatePagesGetAllFailed()
      );
    });

    it('clears the fetching all flag', () => {
      expect(state.fetchingAll).toBeFalsy();
    });
  });

  describe('selecting duplicate pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selected: [DUPLICATE_PAGE_1] },
        new DuplicatePagesSelect({ pages: PAGES })
      );
    });

    it('updates the selected pages', () => {
      expect(state.selected).toEqual(PAGES);
    });
  });

  describe('deselecting duplicate pages', () => {
    const DESELECTIONS = [DUPLICATE_PAGE_2];

    beforeEach(() => {
      state = reducer(
        { ...state, selected: PAGES },
        new DuplicatePagesDeselect({ pages: DESELECTIONS })
      );
    });

    it('updates the selected pages', () => {
      DESELECTIONS.forEach(page => expect(state.selected).not.toContain(page));
    });

    it('does not remove other pages', () => {
      expect(state.selected).not.toEqual([]);
    });
  });

  describe('setting the blocked state on duplicate pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, setBlocking: false },
        new DuplicatePagesSetBlocking({ pages: PAGES, blocking: true })
      );
    });

    it('sets the set blocking flag', () => {
      expect(state.setBlocking).toBeTruthy();
    });
  });

  describe('when the blocked state has been set for pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, setBlocking: true, pages: [] },
        new DuplicatePagesBlockingSet({ pages: PAGES })
      );
    });

    it('clears the set blocking flag', () => {
      expect(state.setBlocking).toBeFalsy();
    });

    it('updates the page list', () => {
      expect(state.pages).toEqual(PAGES);
    });
  });

  describe('failure to set blocking state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, setBlocking: true },
        new DuplicatePagesSetBlockingFailed()
      );
    });

    it('clears the set blocking flag', () => {
      expect(state.setBlocking).toBeFalsy();
    });
  });

  describe('marking duplicate pages as deleted', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, setDeleted: false },
        new DuplicatePagesSetDeleted({ pages: PAGES, deleted: true })
      );
    });

    it('sets the setting deleted flag', () => {
      expect(state.setDeleted).toBeTruthy();
    });
  });

  describe('when the pages are marked as deleted', () => {
    const ORIGINAL = PAGES[0];
    const UPDATED = {
      ...ORIGINAL,
      blocked: !ORIGINAL.blocked
    };

    beforeEach(() => {
      state = reducer(
        { ...state, setDeleted: true, pages: [] },
        new DuplicatePagesDeletedSet({ pages: [UPDATED] })
      );
    });

    it('clears the setting deleted flag', () => {
      expect(state.setDeleted).toBeFalsy();
    });

    it('merges the updated page into the list of duplicate pages', () => {
      expect(state.pages).toContain(UPDATED);
      expect(state.pages).not.toContain(ORIGINAL);
    });
  });

  describe('when deleting duplicate pages fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, setDeleted: true },
        new DuplicatePagesSetDeletedFailed()
      );
    });

    it('clears the setting deleted flag', () => {
      expect(state.setDeleted).toBeFalsy();
    });
  });
});
