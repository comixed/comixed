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

import { beforeEach } from 'vitest';
import {
  COMIC_DETAIL_FEATURE_KEY,
  ComicDetailState,
  initialComicDetailState
} from '@app/library/reducers/comic-detail.reducer';
import {
  selectComicDetailComic,
  selectComicDetailLoaded
} from '@app/library/selectors/comic-detail.selectors';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('CurrentUser Selectors', () => {
  const TEST_COMIC = COMIC_1;

  let state: ComicDetailState;

  beforeEach(() => {
    state = { ...initialComicDetailState };
  });

  describe('the comic loading flag', () => {
    it('should return true when loading', () => {
      expect(
        selectComicDetailLoaded({
          [COMIC_DETAIL_FEATURE_KEY]: { ...state, loading: true }
        })
      ).toBeTruthy();
    });

    it('should return false when not loading', () => {
      expect(
        selectComicDetailLoaded({
          [COMIC_DETAIL_FEATURE_KEY]: { ...state, loading: false }
        })
      ).toBeFalsy();
    });
  });

  describe('the comic detail', () => {
    it('should return the comic when loaded', () => {
      expect(
        selectComicDetailComic({
          [COMIC_DETAIL_FEATURE_KEY]: { ...state, comic: TEST_COMIC }
        })
      ).toBe(TEST_COMIC);
    });

    it('should return false when not loading', () => {
      expect(
        selectComicDetailComic({
          [COMIC_DETAIL_FEATURE_KEY]: { ...state, comic: null }
        })
      ).toBeNull();
    });
  });
});
