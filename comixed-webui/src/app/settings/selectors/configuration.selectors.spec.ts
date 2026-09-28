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

import { beforeEach } from 'vitest';
import {
  CONFIGURATION_FEATURE_KEY,
  configurationAdapter,
  ConfigurationState,
  initialConfigurationState
} from '@app/settings/reducers/configuration.reducer';
import {
  TEST_CONFIGURATION_OPTIONS_1,
  TEST_CONFIGURATION_OPTIONS_2
} from '@app/settings/settings-fixtures';
import {
  selectConfigurationBusy,
  selectConfigurationEntries
} from '@app/settings/selectors/configuration.selectors';

describe('Configuration Selectors', () => {
  const TEST_CONFIGURATION_OPTION_LIST = [
    TEST_CONFIGURATION_OPTIONS_1,
    TEST_CONFIGURATION_OPTIONS_2
  ];
  const TEST_TOTAL = 51;

  let state: ConfigurationState;

  beforeEach(() => {
    state = configurationAdapter.setAll(TEST_CONFIGURATION_OPTION_LIST, {
      ...initialConfigurationState,
      total: TEST_TOTAL,
      busy: false
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when busy', () => {
      expect(
        selectConfigurationBusy({
          [CONFIGURATION_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when busy', () => {
      expect(
        selectConfigurationBusy({
          [CONFIGURATION_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the configuration option list', () => {
    expect(
      selectConfigurationEntries({ [CONFIGURATION_FEATURE_KEY]: { ...state } })
    ).toStrictEqual(TEST_CONFIGURATION_OPTION_LIST);
  });
});
