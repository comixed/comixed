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
  CONFIGURATION_OPTION_LIST_FEATURE_KEY,
  ConfigurationOptionListState
} from '../reducers/configuration-option-list.reducer';
import {
  selectConfigurationOptionListState,
  selectConfigurationOptions
} from './configuration-option-list.selectors';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';

describe('ConfigurationOptionList Selectors', () => {
  let state: ConfigurationOptionListState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      saving: Math.random() > 0.5,
      options: [
        CONFIGURATION_OPTION_1,
        CONFIGURATION_OPTION_2,
        CONFIGURATION_OPTION_3,
        CONFIGURATION_OPTION_4,
        CONFIGURATION_OPTION_5
      ]
    };
  });

  it('should select the feature state', () => {
    expect(
      selectConfigurationOptionListState({
        [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the option list', () => {
    expect(
      selectConfigurationOptions({
        [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.options);
  });
});
