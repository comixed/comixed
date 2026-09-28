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
  ConfigurationOptionListState,
  initialState,
  reducer
} from './configuration-option-list.reducer';
import {
  configurationOptionsLoaded,
  loadConfigurationOptions,
  loadConfigurationOptionsFailed
} from '@app/admin/actions/configuration-option-list.actions';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';

describe('ConfigurationOptionList Reducer', () => {
  const OPTIONS = [
    CONFIGURATION_OPTION_1,
    CONFIGURATION_OPTION_2,
    CONFIGURATION_OPTION_3,
    CONFIGURATION_OPTION_4,
    CONFIGURATION_OPTION_5
  ];

  let state: ConfigurationOptionListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('has no options', () => {
      expect(state.options).toEqual([]);
    });
  });

  describe('loading the configuration options', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadConfigurationOptions());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving the configuration options', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, options: [] },
        configurationOptionsLoaded({ options: OPTIONS })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the configuration options', () => {
      expect(state.options).toEqual(OPTIONS);
    });
  });

  describe('failure to load configuration options', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true },
        loadConfigurationOptionsFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });
});
