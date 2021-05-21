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
  reducer,
  UpdateComicInfoState
} from './update-comic-info.reducer';
import { COMIC_3 } from '@app/comic-book/comic-book.fixtures';
import {
  comicInfoUpdated,
  updateComicInfo,
  updateComicInfoFailed
} from '@app/comic-book/actions/update-comic-info.actions';

describe('UpdateComicInfo Reducer', () => {
  const COMIC = COMIC_3;

  let state: UpdateComicInfoState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('updating a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating: false },
        updateComicInfo({ comic: COMIC })
      );
    });

    it('sets the updating flag', () => {
      expect(state.updating).toBeTrue();
    });
  });

  describe('success updating a comic', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: true }, comicInfoUpdated());
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });

  describe('failure updating a comic', () => {
    beforeEach(() => {
      state = reducer({ ...state, updating: true }, updateComicInfoFailed());
    });

    it('clears the updating flag', () => {
      expect(state.updating).toBeFalse();
    });
  });
});
