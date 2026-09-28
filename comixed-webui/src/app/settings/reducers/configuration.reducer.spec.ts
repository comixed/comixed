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
  configurationAdapter,
  configurationReducer,
  ConfigurationState,
  initialConfigurationState
} from '../reducers/configuration.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import {
  TEST_CONFIGURATION_OPTIONS_1,
  TEST_CONFIGURATION_OPTIONS_2
} from '@app/settings/settings-fixtures';
import { ConfigurationActions } from '@app/settings/actions/configuration.actions';

describe('Configuration Reducer', () => {
  const TEST_CONFIGURATION_OPTION_LIST = [
    TEST_CONFIGURATION_OPTIONS_1,
    TEST_CONFIGURATION_OPTIONS_2
  ];

  let state: ConfigurationState;

  beforeEach(() => {
    state = { ...initialConfigurationState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = configurationReducer({ ...state }, {} as Action<string>);
    });

    it('should clear the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should contain no options', () => {
      expect(
        configurationAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });
  });

  describe('loading', () => {
    beforeEach(() => {
      state = configurationReducer(
        { ...state, busy: false },
        ConfigurationActions.load()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = configurationReducer(
          configurationAdapter.setAll([], {
            ...state,
            busy: true
          }),
          ConfigurationActions.loadSuccess({
            entries: TEST_CONFIGURATION_OPTION_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of options', () => {
        expect(
          configurationAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_CONFIGURATION_OPTION_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = configurationReducer(
          configurationAdapter.setAll([], {
            ...state,
            busy: true
          }),
          ConfigurationActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('saving', () => {
    beforeEach(() => {
      state = configurationReducer(
        { ...state, busy: false },
        ConfigurationActions.save({ entries: TEST_CONFIGURATION_OPTION_LIST })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = configurationReducer(
          configurationAdapter.setAll([], {
            ...state,
            busy: true
          }),
          ConfigurationActions.saveSuccess({
            entries: TEST_CONFIGURATION_OPTION_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of options', () => {
        expect(
          configurationAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_CONFIGURATION_OPTION_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = configurationReducer(
          configurationAdapter.setAll([], {
            ...state,
            busy: true
          }),
          ConfigurationActions.saveFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
