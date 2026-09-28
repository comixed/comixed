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
  SaveConfigurationOptionsState
} from './save-configuration-options.reducer';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';
import {
  configurationOptionsSaved,
  saveConfigurationOptions,
  saveConfigurationOptionsFailed
} from '@app/admin/actions/save-configuration-options.actions';

describe('SaveConfigurationOptions Reducer', () => {
  const OPTIONS = [
    CONFIGURATION_OPTION_1,
    CONFIGURATION_OPTION_2,
    CONFIGURATION_OPTION_3,
    CONFIGURATION_OPTION_4,
    CONFIGURATION_OPTION_5
  ];

  let state: SaveConfigurationOptionsState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('saving configuration options', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        saveConfigurationOptions({ options: OPTIONS })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });
  });

  describe('success', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, configurationOptionsSaved());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('failure', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: true },
        saveConfigurationOptionsFailed()
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });
});
