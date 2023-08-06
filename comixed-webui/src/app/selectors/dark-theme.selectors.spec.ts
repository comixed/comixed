/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  DARK_THEME_FEATURE_KEY,
  DarkThemeState
} from '../reducers/dark-theme.reducer';
import {
  selectDarkThemeActive,
  selectDarkThemeState
} from './dark-theme.selectors';

describe('DarkTheme Selectors', () => {
  const TOGGLE = Math.random() > 0.5;

  let state: DarkThemeState;

  beforeEach(() => {
    state = { toggle: TOGGLE };
  });

  it('should select the feature state', () => {
    expect(
      selectDarkThemeState({
        [DARK_THEME_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the dark theme active flag', () => {
    expect(
      selectDarkThemeActive({
        [DARK_THEME_FEATURE_KEY]: state
      })
    ).toEqual(TOGGLE);
  });
});
