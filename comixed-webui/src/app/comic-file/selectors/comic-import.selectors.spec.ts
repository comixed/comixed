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
  COMIC_IMPORT_FEATURE_KEY,
  ComicImportState
} from '../reducers/comic-import.reducer';
import { selectComicImportState } from './comic-import.selectors';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3
} from '@app/comic-file/comic-file.fixtures';

describe('ComicImport Selectors', () => {
  let state: ComicImportState;

  beforeEach(() => {
    state = {
      importing: Math.random() > 0.5
    };
  });

  it('should select the feature state', () => {
    expect(
      selectComicImportState({
        [COMIC_IMPORT_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
