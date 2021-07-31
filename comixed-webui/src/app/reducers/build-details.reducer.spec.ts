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
  BuildDetailsState,
  initialState,
  reducer
} from './build-details.reducer';
import {
  buildDetailsLoaded,
  loadBuildDetails,
  loadBuildDetailsFailed
} from '@app/actions/build-details.actions';
import { BUILD_DETAILS } from '@app/app.fixtures';

describe('ServerStatus Reducer', () => {
  let state: BuildDetailsState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading state', () => {
      expect(state.loading).toBeFalse();
    });

    it('has no status', () => {
      expect(state.details).toBeNull();
    });
  });

  describe('loading the build details', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadBuildDetails());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving the build details', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, details: null },
        buildDetailsLoaded({ details: BUILD_DETAILS })
      );
    });

    it('clears the loading state', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the build details', () => {
      expect(state.details).toEqual(BUILD_DETAILS);
    });
  });

  describe('failure to load the build details', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadBuildDetailsFailed());
    });

    it('clears the loading state', () => {
      expect(state.loading).toBeFalse();
    });
  });
});
