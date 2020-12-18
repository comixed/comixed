/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { DisplayState, initialState, reducer } from './display.reducer';
import { PAGE_SIZE_DEFAULT } from '@app/library/library.constants';
import {
  pageSizeSet,
  resetDisplayOptions,
  setPageSize
} from '@app/library/actions/display.actions';
import { USER_READER } from '@app/user/user.fixtures';

describe('Display Reducer', () => {
  const USER = USER_READER;

  let state: DisplayState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has a default page size', () => {
      expect(state.pageSize).toEqual(PAGE_SIZE_DEFAULT);
    });
  });

  describe('resetting the display options without a user', () => {
    beforeEach(() => {
      state = reducer({ ...state, pageSize: 0 }, resetDisplayOptions({}));
    });

    it('sets the default page size', () => {
      expect(state.pageSize).toEqual(PAGE_SIZE_DEFAULT);
    });
  });

  describe('resetting the display options with a user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, pageSize: 0 },
        resetDisplayOptions({ user: USER })
      );
    });

    it('sets the default page size', () => {
      expect(state.pageSize).toEqual(PAGE_SIZE_DEFAULT);
    });
  });

  describe('setting the page size', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, pageSize: 0 },
        setPageSize({ size: PAGE_SIZE_DEFAULT, save: false })
      );
    });

    it('sets the page size', () => {
      expect(state.pageSize).toEqual(PAGE_SIZE_DEFAULT);
    });
  });

  describe('when the page size has been set', () => {
    let originalState: DisplayState;

    beforeEach(() => {
      originalState = { ...state };
      state = reducer({ ...state }, pageSizeSet());
    });

    it('does not change the state', () => {
      expect(state).toEqual(originalState);
    });
  });
});
