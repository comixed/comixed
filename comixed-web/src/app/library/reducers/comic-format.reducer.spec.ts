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
  ComicFormatState,
  initialState,
  reducer
} from './comic-format.reducer';
import { FORMAT_1, FORMAT_3, FORMAT_5 } from '@app/library/library.fixtures';
import {
  comicFormatAdded,
  resetComicFormats
} from '@app/library/actions/comic-format.actions';

describe('ComicFormat Reducer', () => {
  let state: ComicFormatState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no formats', () => {
      expect(state.formats).toEqual([]);
    });
  });

  describe('resetting the state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, formats: [FORMAT_1, FORMAT_3, FORMAT_5] },
        resetComicFormats()
      );
    });

    it('clears the formats', () => {
      expect(state.formats).toEqual([]);
    });
  });

  describe('adding a new comic format', () => {
    const EXISTING_FORMAT = FORMAT_1;
    const NEW_FORMAT = FORMAT_3;

    beforeEach(() => {
      state = reducer(
        { ...state, formats: [EXISTING_FORMAT] },
        comicFormatAdded({ format: NEW_FORMAT })
      );
    });

    it('retains the existing format', () => {
      expect(state.formats).toContain(EXISTING_FORMAT);
    });

    it('adds the new format', () => {
      expect(state.formats).toContain(NEW_FORMAT);
    });
  });

  describe('updating an exisiting comic format', () => {
    const EXISTING_FORMAT = FORMAT_1;
    const UPDATED_FORMAT = {
      ...EXISTING_FORMAT,
      name: EXISTING_FORMAT.name.substr(1)
    };

    beforeEach(() => {
      state = reducer(
        { ...state, formats: [EXISTING_FORMAT] },
        comicFormatAdded({ format: UPDATED_FORMAT })
      );
    });

    it('removes the existing format', () => {
      expect(state.formats).not.toContain(EXISTING_FORMAT);
    });

    it('adds the updated format', () => {
      expect(state.formats).toContain(UPDATED_FORMAT);
    });
  });
});
