/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
  duplicateComicListAdapter,
  duplicateComicListReducer,
  DuplicateComicListState,
  initialDuplicateComicListState
} from './duplicate-comic-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { DuplicateComicListActions } from '@app/admin/actions/duplicate-comic-list.actions';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2
} from '@app/admin/admin-fixtures';

describe('DuplicateComic Reducer', () => {
  const TEST_DUPLICATE_COMIC_LIST = [DUPLICATE_COMIC_1, DUPLICATE_COMIC_2];
  const TEST_TOTAL = 320;

  let state: DuplicateComicListState;

  beforeEach(() => {
    state = { ...initialDuplicateComicListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = duplicateComicListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have no total', () => {
      expect(state.total).toBe(0);
    });
  });

  describe('loading duplicate comics', () => {
    beforeEach(() => {
      state = duplicateComicListReducer(
        { ...state, busy: false },
        DuplicateComicListActions.load({
          index: 1,
          size: 25,
          sortBy: 'volume',
          sortDirection: 'asc'
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = duplicateComicListReducer(
          duplicateComicListAdapter.setAll([], {
            ...state,
            busy: true,
            total: 0
          }),
          DuplicateComicListActions.loadSuccess({
            entries: TEST_DUPLICATE_COMIC_LIST,
            total: TEST_TOTAL
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should set the list of duplication comics', () => {
        expect(
          duplicateComicListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_DUPLICATE_COMIC_LIST);
      });

      it('should update the total count', () => {
        expect(state.total).toBe(TEST_TOTAL);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = duplicateComicListReducer(
          duplicateComicListAdapter.setAll([], {
            ...state,
            busy: true,
            total: 0
          }),
          DuplicateComicListActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
