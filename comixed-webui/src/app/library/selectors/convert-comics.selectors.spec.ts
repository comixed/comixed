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
  CONVERT_COMICS_FEATURE_KEY,
  ConvertComicsState
} from '../reducers/convert-comics.reducer';
import { selectConvertComicsState } from './convert-comics.selectors';

describe('ConvertComics Selectors', () => {
  let state: ConvertComicsState;

  beforeEach(() => {
    state = { converting: Math.random() > 0.5 };
  });

  it('should select the feature state', () => {
    expect(
      selectConvertComicsState({
        [CONVERT_COMICS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
