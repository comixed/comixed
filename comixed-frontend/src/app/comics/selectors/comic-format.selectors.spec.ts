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
  COMIC_FORMAT_FEATURE_KEY,
  ComicFormatState
} from '../reducers/comic-format.reducer';
import {
  selectComicFormats,
  selectComicFormatState
} from './comic-format.selectors';
import {
  FORMAT_1,
  FORMAT_2,
  FORMAT_3,
  FORMAT_4,
  FORMAT_5
} from 'app/comics/comics.fixtures';

describe('Formats Selectors', () => {
  const FORMATS = [FORMAT_1, FORMAT_2, FORMAT_3, FORMAT_4, FORMAT_5];

  let state: ComicFormatState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      loaded: Math.random() > 0.5,
      formats: FORMATS
    };
  });

  it('selects the feature state', () => {
    expect(
      selectComicFormatState({
        [COMIC_FORMAT_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the comic formats', () => {
    expect(
      selectComicFormats({
        [COMIC_FORMAT_FEATURE_KEY]: state
      })
    ).toEqual(state.formats);
  });
});
