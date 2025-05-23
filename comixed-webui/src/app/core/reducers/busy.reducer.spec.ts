/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { BusyState, initialState, reducer } from './busy.reducer';
import {
  BusyIcon,
  setBusyState,
  setBusyStateWithIcon
} from '@app/core/actions/busy.actions';

describe('Busy Reducer', () => {
  let state: BusyState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the enabled flag', () => {
      expect(state.enabled).toBeFalse();
    });

    it('has the default icon', () => {
      expect(state.icon).toBe(BusyIcon.DEFAULT);
    });
  });

  describe('enabling busy mode', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, enabled: false, icon: BusyIcon.SEARCHING },
        setBusyState({ enabled: true })
      );
    });

    it('sets the enabled flag', () => {
      expect(state.enabled).toBeTrue();
    });

    it('has the default icon', () => {
      expect(state.icon).toBe(BusyIcon.DEFAULT);
    });
  });

  describe('enabling busy mode with an icon', () => {
    const ICON = BusyIcon.LOADING;

    beforeEach(() => {
      state = reducer(
        { ...state, enabled: false, icon: BusyIcon.DEFAULT },
        setBusyStateWithIcon({ enabled: true, icon: ICON })
      );
    });

    it('sets the enabled flag', () => {
      expect(state.enabled).toBeTrue();
    });

    it('sets the icon', () => {
      expect(state.icon).toBe(ICON);
    });
  });

  describe('disabling busy mode', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, enabled: true },
        setBusyState({ enabled: false })
      );
    });

    it('clears the enabled flag', () => {
      expect(state.enabled).toBeFalse();
    });
  });
});
