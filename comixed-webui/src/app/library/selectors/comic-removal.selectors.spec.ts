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
  COMIC_REMOVAL_FEATURE_KEY,
  ComicRemovalState,
  initialComicRemovalState
} from '../reducers/comic-removal.reducer';
import { selectComicRemovalBusy } from './comic-removal.selectors';
import { beforeEach } from 'vitest';

describe('ComicRemoval Selectors', () => {
  let state: ComicRemovalState;

  beforeEach(() => {
    state = { ...initialComicRemovalState };
  });

  describe('the busy flag', () => {
    it('should return true when busy', () => {
      expect(
        selectComicRemovalBusy({
          [COMIC_REMOVAL_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });

    it('should return false when not busy', () => {
      expect(
        selectComicRemovalBusy({
          [COMIC_REMOVAL_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });
  });
});
