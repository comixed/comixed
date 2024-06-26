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
  selectComicFileGroups,
  selectComicFileListState,
  selectComicFiles,
  selectComicFileSelections
} from './comic-file-list.selectors';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3
} from '@app/comic-files/comic-file.fixtures';
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';

describe('ComicFileList Selectors', () => {
  const GROUPS: ComicFileGroup[] = [
    {
      directory: 'directory1',
      files: [COMIC_FILE_1, COMIC_FILE_3]
    },
    {
      directory: 'directory2',
      files: [COMIC_FILE_2]
    }
  ];
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];

  let state: ComicFileListState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      groups: GROUPS,
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

  it('should select the comic groups', () => {
    expect(
      selectComicFileGroups({
        [COMIC_FILE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.groups);
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
