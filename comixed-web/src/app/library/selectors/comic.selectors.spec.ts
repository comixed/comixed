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

import { COMIC_FEATURE_KEY, ComicState } from '../reducers/comic.reducer';
import {
  selectComic,
  selectComicBusy,
  selectComicState
} from './comic.selectors';
import { COMIC_3 } from '@app/library/library.fixtures';

describe('Comic Selectors', () => {
  let state: ComicState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      comic: COMIC_3,
      saving: Math.random() > 0.5,
      saved: Math.random() > 0.5
    };
  });

  it('should select the feature state', () => {
    expect(
      selectComicState({
        [COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the current comic', () => {
    expect(selectComic({ [COMIC_FEATURE_KEY]: state })).toEqual(state.comic);
  });

  it('should select the busy state', () => {
    expect(selectComicBusy({ [COMIC_FEATURE_KEY]: state })).toEqual(
      state.loading || state.saving
    );
  });
});
