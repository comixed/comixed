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
  COMIC_FILE_LIST_FEATURE_KEY,
  ComicFileListState
} from '../reducers/comic-file-list.reducer';
import {
  selectComicFileListState,
  selectComicFiles,
  selectComicFileSelections
} from './comic-file-list.selectors';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3
} from '@app/comic-file/comic-file.fixtures';

describe('ComicFileList Selectors', () => {
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];

  let state: ComicFileListState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      files: FILES,
      selections: FILES
    };
  });

  it('should select the feature state', () => {
    expect(
      selectComicFileListState({
        [COMIC_FILE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the comic files', () => {
    expect(
      selectComicFiles({
        [COMIC_FILE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.files);
  });

  it('should select the selected comic files', () => {
    expect(
      selectComicFileSelections({
        [COMIC_FILE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.selections);
  });
});
