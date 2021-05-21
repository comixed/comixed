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
import {
  comicFormatsLoaded,
  loadComicFormats,
  loadComicFormatsFailed
} from '@app/comic-book/actions/comic-format.actions';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from '@app/comic-book/comic-book.fixtures';

describe('ComicFormat Reducer', () => {
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];

  let state: ComicFormatState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('clears the loaded flag', () => {
      expect(state.loaded).toBeFalse();
    });

    it('has no formats', () => {
      expect(state.formats).toEqual([]);
    });
  });

  describe('loading the comic formats', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadComicFormats());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('when the comic formats are loaded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, loaded: false, formats: [] },
        comicFormatsLoaded({ formats: FORMATS })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the loaded flag', () => {
      expect(state.loaded).toBeTrue();
    });

    it('sets the comic formats', () => {
      expect(state.formats).toEqual(FORMATS);
    });
  });

  describe('when the comic formats fail to load', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, loaded: true },
        loadComicFormatsFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });
});
