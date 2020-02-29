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
  initial_state,
  BuildDetailsState
} from './build-details.reducer';
import {
  BuildDetailsGet,
  BuildDetailsGetFailed,
  BuildDetailsReceive
} from 'app/backend-status/actions/build-details.actions';
import { BUILD_DETAILS } from 'app/backend-status/models/build-details.fixtures';

describe('BuildDetails Reducer', () => {
  let state: BuildDetailsState;

  beforeEach(() => {
    state = initial_state;
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching build details flag', () => {
      expect(state.fetching_details).toBeFalsy();
    });

    it('has no build details', () => {
      expect(state.details).toBeNull();
    });
  });

  describe('when getting the build details', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_details: false },
        new BuildDetailsGet()
      );
    });

    it('sets the fetching details flag', () => {
      expect(state.fetching_details).toBeTruthy();
    });
  });

  describe('when the build details are received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_details: true, details: null },
        new BuildDetailsReceive({ build_details: BUILD_DETAILS })
      );
    });

    it('clears the fetching details flag', () => {
      expect(state.fetching_details).toBeFalsy();
    });

    it('sets the details', () => {
      expect(state.details).toEqual(BUILD_DETAILS);
    });
  });

  describe('when it fails to get the build details', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_details: true },
        new BuildDetailsGetFailed()
      );
    });

    it('clears the fetching details flag', () => {
      expect(state.fetching_details).toBeFalsy();
    });
  });
});
