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

import { initialState, reducer, ReleaseDetailsState } from './release.reducer';
import {
  currentReleaseDetailsLoaded,
  latestReleaseDetailsLoaded,
  loadCurrentReleaseDetails,
  loadCurrentReleaseDetailsFailed,
  loadLatestReleaseDetails,
  loadLatestReleaseDetailsFailed
} from '@app/actions/release.actions';
import { CURRENT_RELEASE, LATEST_RELEASE } from '@app/app.fixtures';

describe('Release Reducer', () => {
  let state: ReleaseDetailsState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the current loading state', () => {
      expect(state.currentLoading).toBeFalse();
    });

    it('has no current build', () => {
      expect(state.current).toBeNull();
    });

    it('clears the latest loading state', () => {
      expect(state.latestLoading).toBeFalse();
    });

    it('has no statest build', () => {
      expect(state.latest).toBeNull();
    });
  });

  describe('loading the current build details', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, currentLoading: false },
        loadCurrentReleaseDetails()
      );
    });

    it('sets the current loading flag', () => {
      expect(state.currentLoading).toBeTrue();
    });
  });

  describe('receiving the current build details', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, currentLoading: true, current: null },
        currentReleaseDetailsLoaded({ details: CURRENT_RELEASE })
      );
    });

    it('clears the current loading state', () => {
      expect(state.currentLoading).toBeFalse();
    });

    it('sets the current build details', () => {
      expect(state.current).toEqual(CURRENT_RELEASE);
    });
  });

  describe('failure to load the current build details', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, currentLoading: true },
        loadCurrentReleaseDetailsFailed()
      );
    });

    it('clears the current loading state', () => {
      expect(state.currentLoading).toBeFalse();
    });
  });

  describe('fetching the latest version', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, latestLoading: false },
        loadLatestReleaseDetails()
      );
    });

    it('sets the latest loading flags', () => {
      expect(state.latestLoading).toBeTrue();
    });
  });

  describe('receiving the latest version', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, latestLoading: true, latest: null },
        latestReleaseDetailsLoaded({ details: LATEST_RELEASE })
      );
    });

    it('clears the latest loading flags', () => {
      expect(state.latestLoading).toBeFalse();
    });

    it('sets the latest release', () => {
      expect(state.latest).toEqual(LATEST_RELEASE);
    });
  });

  describe('fetching the latest version', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, latestLoading: true },
        loadLatestReleaseDetailsFailed()
      );
    });

    it('clears the loading flags', () => {
      expect(state.latestLoading).toBeFalse();
    });
  });
});
