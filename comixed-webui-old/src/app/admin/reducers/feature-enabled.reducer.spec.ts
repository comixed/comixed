/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  FeatureEnabledState,
  initialState,
  reducer
} from './feature-enabled.reducer';
import {
  getFeatureEnabled,
  getFeatureEnabledFailure,
  getFeatureEnabledSuccess
} from '@app/admin/actions/feature-enabled.actions';

describe('FeatureEnabled Reducer', () => {
  const FEATURE_NAME = 'feature.name';
  const FEATURE_ENABLED = Math.random() > 0.5;

  let state: FeatureEnabledState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no features loaded', () => {
      expect(state.features).toEqual([]);
    });
  });

  describe('loading the enabled state for a feature', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: false },
        getFeatureEnabled({ name: FEATURE_NAME })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...initialState, busy: true, features: [] },
          getFeatureEnabledSuccess({
            name: FEATURE_NAME,
            enabled: FEATURE_ENABLED
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the feature enabled state', () => {
        expect(state.features).toEqual([
          { name: FEATURE_NAME, enabled: FEATURE_ENABLED }
        ]);
      });
    });

    describe('success when feature was already loaded and toggled', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...initialState,
            busy: true,
            features: [{ name: FEATURE_NAME, enabled: !FEATURE_ENABLED }]
          },
          getFeatureEnabledSuccess({
            name: FEATURE_NAME,
            enabled: FEATURE_ENABLED
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the feature enabled state', () => {
        expect(state.features).toEqual([
          { name: FEATURE_NAME, enabled: FEATURE_ENABLED }
        ]);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: false,
            features: [{ name: FEATURE_NAME, enabled: FEATURE_ENABLED }]
          },
          getFeatureEnabledFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('does not change the feature enabled list', () => {
        expect(state.features).toEqual([
          { name: FEATURE_NAME, enabled: FEATURE_ENABLED }
        ]);
      });
    });
  });
});
