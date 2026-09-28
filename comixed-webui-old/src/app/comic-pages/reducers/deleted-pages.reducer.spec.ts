/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  DeletedPagesState,
  initialState,
  reducer
} from './deleted-pages.reducer';
import {
  deletedPagesLoaded,
  loadDeletedPages,
  loadDeletedPagesFailed
} from '@app/comic-pages/actions/deleted-pages.actions';
import {
  DELETED_PAGE_1,
  DELETED_PAGE_2,
  DELETED_PAGE_3,
  DELETED_PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';

describe('DeletedPages Reducer', () => {
  const DELETED_PAGE_LIST = [
    DELETED_PAGE_1,
    DELETED_PAGE_2,
    DELETED_PAGE_3,
    DELETED_PAGE_4
  ];

  let state: DeletedPagesState;

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

    it('has no deleted page list', () => {
      expect(state.list).toEqual([]);
    });

    it('has no current page', () => {
      expect(state.current).toBeNull();
    });
  });

  describe('loading the deleted pages', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadDeletedPages());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('receiving the deleted page list', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          busy: true,
          list: DELETED_PAGE_LIST.reverse()
        },
        deletedPagesLoaded({ pages: DELETED_PAGE_LIST })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('replaces the deleted page list', () => {
      expect(state.list).toEqual(DELETED_PAGE_LIST);
    });
  });

  describe('failure to load the deleted page list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, list: DELETED_PAGE_LIST },
        loadDeletedPagesFailed()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('leaves the deleted page list untouched', () => {
      expect(state.list).toEqual(DELETED_PAGE_LIST);
    });
  });
});
