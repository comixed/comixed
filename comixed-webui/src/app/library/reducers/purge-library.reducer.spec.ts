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
  PurgeLibraryState,
  reducer
} from './purge-library.reducer';
import {
  libraryPurging,
  purgeLibrary,
  purgeLibraryFailed
} from '@app/library/actions/purge-library.actions';
import { Confirmation } from '@tragically-slick/confirmation';
import { compose } from '@ngrx/store';

describe('PurgeLibrary Reducer', () => {
  let state: PurgeLibraryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalse();
    });
  });

  describe('starting the purge', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: false }, purgeLibrary());
    });

    it('sets the working flag', () => {
      expect(state.working).toBeTrue();
    });
  });

  describe('success starting', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: true }, libraryPurging());
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalse();
    });
  });

  describe('failure starting', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: true }, purgeLibraryFailed());
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalse();
    });
  });
});
