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
  selectComicDetail,
  selectComicDetailLoaded,
  selectComicDetailPages,
  selectComicDetailTags
} from '@app/library/selectors/comic-detail.selectors';
import {
  COMIC_1,
  COMIC_PAGE_1,
  COMIC_TAG_1
} from '@app/library/library-fixtures';

describe('CurrentUser Selectors', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_TAGS = [COMIC_TAG_1];
  const TEST_PAGES = [COMIC_PAGE_1];

  let state: ComicDetailState;

  beforeEach(() => {
    state = { ...initialComicDetailState };
  });

  describe('the comic busy flag', () => {
    it('should return true when busy', () => {
      expect(
        selectComicDetailLoaded({
          [COMIC_DETAIL_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });

    it('should return false when not busy', () => {
      expect(
        selectComicDetailLoaded({
          [COMIC_DETAIL_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });
  });

  describe('the comic detail', () => {
    it('should return the comic when loaded', () => {
      expect(
        selectComicDetail({
          [COMIC_DETAIL_FEATURE_KEY]: { ...state, comic: TEST_COMIC }
        })
      ).toBe(TEST_COMIC);
    });

    it('should return false when not busy', () => {
      expect(
        selectComicDetail({
          [COMIC_DETAIL_FEATURE_KEY]: { ...state, comic: null }
        })
      ).toBeNull();
    });
  });

  it('should return the tags', () => {
    expect(
      selectComicDetailTags({
        [COMIC_DETAIL_FEATURE_KEY]: {
          ...initialComicDetailState,
          tags: TEST_TAGS
        }
      })
    ).toBe(TEST_TAGS);
  });

  it('should return the pages', () => {
    expect(
      selectComicDetailPages({
        [COMIC_DETAIL_FEATURE_KEY]: {
          ...initialComicDetailState,
          pages: TEST_PAGES
        }
      })
    ).toBe(TEST_PAGES);
  });
});
