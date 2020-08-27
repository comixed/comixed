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
  FIND_COMIC_FILES_FEATURE_KEY,
  FindComicFilesState
} from '../reducers/find-comic-files.reducer';
import {
  selectFindComicFiles,
  selectFindComicFilesState
} from './find-comic-files.selectors';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/comic-import/comic-import.fixtures';

describe('FindComicFiles Selectors', () => {
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let state: FindComicFilesState;

  beforeEach(() => {
    state = {
      finding: Math.random() * 100 > 50,
      files: COMIC_FILES
    } as FindComicFilesState;
  });

  it('selects the feature state', () => {
    expect(
      selectFindComicFilesState({
        [FIND_COMIC_FILES_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects for the comic files', () => {
    expect(
      selectFindComicFiles({ [FIND_COMIC_FILES_FEATURE_KEY]: state })
    ).toEqual(state.files);
  });
});
