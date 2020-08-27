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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import {
  initialState,
  reducer,
  SelectedComicFilesState
} from './selected-comic-files.reducer';
import {
  COMIC_FILE_1,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/comic-import/comic-import.fixtures';
import {
  clearComicFileSelections,
  deselectComicFile,
  selectComicFile
} from 'app/comic-import/actions/selected-comic-files.actions';

describe('SelectedComicFiles Reducer', () => {
  const SELECTED = [COMIC_FILE_1, COMIC_FILE_3];

  let state: SelectedComicFilesState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no comic files selected', () => {
      expect(state.files).toEqual([]);
    });
  });

  describe('clearing the comic files selection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, files: SELECTED },
        clearComicFileSelections()
      );
    });

    it('has no comic files selected', () => {
      expect(state.files).toEqual([]);
    });
  });

  describe('selecting a comic file', () => {
    const COMIC_FILE = COMIC_FILE_4;

    beforeEach(() => {
      state = reducer(
        { ...state, files: SELECTED },
        selectComicFile({ file: COMIC_FILE })
      );
    });

    it('adds the selected file to the state', () => {
      expect(state.files).toContain(COMIC_FILE);
    });
  });

  describe('deselecting a comic file', () => {
    const COMIC_FILE = SELECTED[0];

    beforeEach(() => {
      state = reducer(
        { ...state, files: SELECTED },
        deselectComicFile({ file: COMIC_FILE })
      );
    });

    it('adds the selected file to the state', () => {
      expect(state.files).not.toContain(COMIC_FILE);
    });
  });
});
