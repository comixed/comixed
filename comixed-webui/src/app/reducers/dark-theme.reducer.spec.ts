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

import { DarkThemeState, initialState, reducer } from './dark-theme.reducer';
import {
  resetActiveTheme,
  toggleDarkThemeMode
} from '@app/actions/dark-theme.actions';

describe('DarkTheme Reducer', () => {
  let state: DarkThemeState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('sets the default state', () => {
      expect(state.toggle).toEqual(false);
    });
  });

  describe('setting the active theme', () => {
    const TOGGLE = Math.random() > 0.5;

    beforeEach(() => {
      state = reducer(
        { ...state, toggle: !TOGGLE },
        toggleDarkThemeMode({ toggle: TOGGLE })
      );
    });

    it('sets the active theme name', () => {
      expect(state.toggle).toEqual(TOGGLE);
    });
  });

  describe('resetting the active theme', () => {
    beforeEach(() => {
      state = reducer({ ...state, toggle: true }, resetActiveTheme());
    });

    it('sets the active theme name', () => {
      expect(state.toggle).toEqual(false);
    });
  });
});
