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

import { ComicFormatState, initialState, reducer } from './comic-format.reducer';
import {
  FORMAT_1,
  FORMAT_2,
  FORMAT_3,
  FORMAT_4,
  FORMAT_5
} from 'app/comics/comics.fixtures';
import {
  comicFormatsLoaded,
  loadComicFormats,
  loadComicFormatsFailed
} from 'app/comics/actions/comic-format.actions';

describe('ComicFormat Reducer', () => {
  const FORMATS = [FORMAT_1, FORMAT_2, FORMAT_3, FORMAT_4, FORMAT_5];

  let state: ComicFormatState;

  beforeEach(() => {
    state = initialState;
  });
  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('clears the loaded flg', () => {
      expect(state.loaded).toBeFalsy();
    });

    it('has no formats', () => {
      expect(state.formats).toEqual([]);
    });
  });

  describe('loading the formats', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true, loaded: true }, loadComicFormats());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });

    it('clears the loaded flag', () => {
      expect(state.loaded).toBeFalsy();
    });
  });

  describe('receiving the formats', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, loaded: false, formats: [] },
        comicFormatsLoaded({ formats: FORMATS })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('sets the loaded flg', () => {
      expect(state.loaded).toBeTruthy();
    });

    it('sets the formats', () => {
      expect(state.formats).toEqual(FORMATS);
    });
  });

  describe('failure to load the formats', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, formats: FORMATS },
        loadComicFormatsFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('leaves the formats intact', () => {
      expect(state.formats).toEqual(FORMATS);
    });
  });
});
