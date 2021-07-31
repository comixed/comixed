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
  ImportCountState,
  initialState,
  reducer
} from './import-count.reducer';
import {
  importCountUpdated,
  startImportCount,
  stopImportCount
} from '@app/actions/import-count.actions';

describe('ImportCount Reducer', () => {
  let state: ImportCountState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the active flag', () => {
      expect(state.active).toBeFalse();
    });

    it('has no count', () => {
      expect(state.count).toEqual(0);
    });
  });

  describe('starting', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, count: 99, active: false },
        startImportCount()
      );
    });

    it('sets the active flag', () => {
      expect(state.active).toBeTrue();
    });

    it('clears the count', () => {
      expect(state.count).toEqual(0);
    });
  });

  describe('updating the count', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));

    beforeEach(() => {
      state = reducer(
        { ...state, count: 0 },
        importCountUpdated({ count: COUNT })
      );
    });

    it('updates the count', () => {
      expect(state.count).toEqual(COUNT);
    });
  });

  describe('stopping', () => {
    beforeEach(() => {
      state = reducer({ ...state, count: 99, active: true }, stopImportCount());
    });

    it('clears the active flag', () => {
      expect(state.active).toBeFalse();
    });

    it('clears the count', () => {
      expect(state.count).toEqual(0);
    });
  });
});
