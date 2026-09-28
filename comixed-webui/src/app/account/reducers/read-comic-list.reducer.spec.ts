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
  initialReadComicListState,
  readComicListAdapter,
  readComicListReducer,
  ReadComicListState
} from './read-comic-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { ReadComicListActions } from '@app/account/actions/read-comic-list.actions';

describe('ReadComicList Reducer', () => {
  const TEST_READ_COMIC_LIST = [3, 7, 18, 22, 937, 1024];

  let state: ReadComicListState;

  beforeEach(() => {
    state = { ...initialReadComicListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = readComicListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });

  describe('updating the read comic list', () => {
    beforeEach(() => {
      state = readComicListReducer(
        readComicListAdapter.setAll([], { ...state }),
        ReadComicListActions.updateList({ comicIds: TEST_READ_COMIC_LIST })
      );
    });

    it('should update the read comic list', () => {
      expect(
        readComicListAdapter.getSelectors().selectAll(state)
      ).toStrictEqual(TEST_READ_COMIC_LIST);
    });
  });

  describe('setting the read state on selected comics', () => {
    beforeEach(() => {
      state = readComicListReducer(
        {
          ...state,
          busy: false
        },
        ReadComicListActions.markSelectedComics({ readState: true })
      );
    });

    it('should set the busy state', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = readComicListReducer(
          { ...state, busy: true },
          ReadComicListActions.markSelectedComicsSuccess()
        );
      });

      it('should clear the busy state', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = readComicListReducer(
          { ...state, busy: true },
          ReadComicListActions.markSelectedComicsFailure()
        );
      });

      it('should clear the busy state', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
