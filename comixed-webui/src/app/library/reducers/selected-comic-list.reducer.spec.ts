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
  initialSelectedComicListState,
  selectedComicListAdapter,
  selectedComicListReducer,
  SelectedComicListState
} from '../reducers/selected-comic-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { SelectedComicListActions } from '@app/library/actions/selected-comic-list.actions';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('SelectedComicList Reducer', () => {
  const TEST_COMIC_IDS = [
    7, 17, 65, 1, 29, 71, 12, 3, 86, 3, 20, 96, 9, 21, 98, 4, 6
  ];
  const TEST_COMIC = COMIC_1;

  let state: SelectedComicListState;

  beforeEach(() => {
    state = { ...initialSelectedComicListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = selectedComicListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });

  describe('loading the selections', () => {
    beforeEach(() => {
      state = selectedComicListReducer(
        { ...state, busy: false },
        SelectedComicListActions.load()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = selectedComicListReducer(
          selectedComicListAdapter.setAll([], {
            ...state,
            busy: true
          }),
          SelectedComicListActions.loadSuccess({ comicIds: TEST_COMIC_IDS })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the selected comic ids', () => {
        expect(
          selectedComicListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_COMIC_IDS.sort((left, right) => left - right));
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = selectedComicListReducer(
          { ...state, busy: true },
          SelectedComicListActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('updating', () => {
    beforeEach(() => {
      state = selectedComicListReducer(
        selectedComicListAdapter.setAll([], { ...state }),
        SelectedComicListActions.updateList({ comicIds: TEST_COMIC_IDS })
      );
    });

    it('should update the selected comic ids', () => {
      expect(
        selectedComicListAdapter.getSelectors().selectAll(state)
      ).toStrictEqual(TEST_COMIC_IDS.sort((left, right) => left - right));
    });
  });

  describe('toggling a comic', () => {
    beforeEach(() => {
      state = selectedComicListReducer(
        {
          ...state,
          busy: false
        },
        SelectedComicListActions.selectComic({
          comic: TEST_COMIC,
          selected: true
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = selectedComicListReducer(
          { ...state, busy: true },
          SelectedComicListActions.selectComicSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = selectedComicListReducer(
          { ...state, busy: true },
          SelectedComicListActions.selectComicFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
