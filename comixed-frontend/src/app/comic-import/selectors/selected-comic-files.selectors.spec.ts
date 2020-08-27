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
  SELECTED_COMIC_FILES_FEATURE_KEY,
  SelectedComicFilesState
} from '../reducers/selected-comic-files.reducer';
import {
  selectSelectedComicFiles,
  selectSelectedComicFilesState
} from './selected-comic-files.selectors';
import {
  COMIC_FILE_1,
  COMIC_FILE_3
} from 'app/comic-import/comic-import.fixtures';

describe('SelectedComicFiles Selectors', () => {
  const SELECTED = [COMIC_FILE_1, COMIC_FILE_3];

  let state: SelectedComicFilesState;

  beforeEach(() => {
    state = { files: SELECTED } as SelectedComicFilesState;
  });

  it('selects the feature state', () => {
    expect(
      selectSelectedComicFilesState({
        [SELECTED_COMIC_FILES_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the selected comic files', () => {
    expect(
      selectSelectedComicFiles({ [SELECTED_COMIC_FILES_FEATURE_KEY]: state })
    ).toEqual(SELECTED);
  });
});
