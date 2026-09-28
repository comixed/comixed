/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
  comicFileListAdapter,
  ComicFileListState,
  initialComicFileListState
} from '@app/library/reducers/comic-file-list.reducer';
import { beforeEach } from 'vitest';
import {
  selectComicFileCount,
  selectComicFileList,
  selectComicFileListBusy,
  selectComicFileSelectedCount
} from '@app/library/selectors/comic-file-list.selectors';
import { COMIC_FILE_1 } from '@app/library/library-fixtures';
import { ComicFileGroup } from '@app/library/models/comic-file-group';

describe('ComicFileList Selectors', () => {
  const TEST_COMIC_FILE = COMIC_FILE_1;
  const TEST_SELECTED_COMIC_FILE = { ...COMIC_FILE_1, selected: true };
  const TEST_COMIC_FILE_GROUP_LIST: ComicFileGroup[] = [
    {
      directory: 'directory1',
      files: [TEST_COMIC_FILE]
    },
    { directory: 'directory2', files: [TEST_SELECTED_COMIC_FILE] }
  ];
  const TEST_COMIC_FILE_LIST = [TEST_COMIC_FILE, TEST_SELECTED_COMIC_FILE];

  let state: ComicFileListState;

  beforeEach(() => {
    state = comicFileListAdapter.setAll(TEST_COMIC_FILE_GROUP_LIST, {
      ...initialComicFileListState
    });
  });

  describe('the busy flag', () => {
    it('should return true when busy', () => {
      expect(
        selectComicFileListBusy({
          [COMIC_FILE_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });

    it('should return false when not busy', () => {
      expect(
        selectComicFileListBusy({
          [COMIC_FILE_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });
  });

  it('should return the list of comic files', () => {
    expect(
      selectComicFileList({ [COMIC_FILE_LIST_FEATURE_KEY]: { ...state } })
    ).toStrictEqual(TEST_COMIC_FILE_LIST);
  });

  it('should return the number of comic files', () => {
    expect(
      selectComicFileCount({
        [COMIC_FILE_LIST_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(2);
  });

  it('should return the number of selected comic files', () => {
    expect(
      selectComicFileSelectedCount({
        [COMIC_FILE_LIST_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(1);
  });
});
