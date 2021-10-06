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

import {
  ComicImportState,
  initialState,
  reducer
} from './comic-import.reducer';
import { setImportingComicsState } from '@app/comic-files/actions/comic-import.actions';

describe('ComicImport Reducer', () => {
  let state: ComicImportState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the importing flag', () => {
      expect(state.importing).toBeFalse();
    });
  });

  describe('the importing comic flag', () => {
    it('can be turned on', () => {
      state = reducer(
        { ...state, importing: false },
        setImportingComicsState({ importing: true })
      );
      expect(state.importing).toBeTrue();
    });

    it('can be turned off', () => {
      state = reducer(
        { ...state, importing: true },
        setImportingComicsState({ importing: false })
      );
      expect(state.importing).toBeFalse();
    });
  });
});
