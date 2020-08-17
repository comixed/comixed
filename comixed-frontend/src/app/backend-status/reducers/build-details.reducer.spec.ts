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
  BuildDetailsState,
  initialState,
  reducer
} from './build-details.reducer';
import {
  buildDetailsReceived,
  fetchBuildDetails,
  fetchBuildDetailsFailed
} from 'app/backend-status/actions/build-details.actions';
import { BUILD_DETAILS_1 } from 'app/backend-status/backend-status.fixtures';

describe('BuildDetail Reducer', () => {
  const BUILD_DETAIL = BUILD_DETAILS_1;

  let state: BuildDetailsState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('has no detail', () => {
      expect(state.details).toBeNull();
    });
  });

  describe('when fetching the build detail', () => {
    beforeEach(() => {
      state = reducer({ ...state, fetching: false }, fetchBuildDetails());
    });

    it('sets the fetching flag', () => {
      expect(state.fetching).toBeTruthy();
    });
  });

  describe('when the build details are received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: true, details: null },
        buildDetailsReceived({ buildDetails: BUILD_DETAIL })
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('sets the build state', () => {
      expect(state.details).toEqual(BUILD_DETAIL);
    });
  });

  describe('when fetching the build details fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: true, details: null },
        fetchBuildDetailsFailed()
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });
  });
});
