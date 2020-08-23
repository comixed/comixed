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
  MOVE_COMICS_FEATURE_KEY,
  MoveComicsState
} from '../reducers/move-comics.reducer';
import {
  selectMoveComicsState,
  selectMoveComicsStateStarting,
  selectMoveComicsStateSuccess
} from './move-comics.selectors';

describe('MoveComics Selectors', () => {
  let state: MoveComicsState;

  beforeEach(() => {
    state = {
      starting: Math.random() * 100 > 50,
      success: Math.random() * 100 > 50
    } as MoveComicsState;
  });

  it('selects for the feature state', () => {
    expect(
      selectMoveComicsState({
        [MOVE_COMICS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects for the starting state', () => {
    expect(
      selectMoveComicsStateStarting({
        [MOVE_COMICS_FEATURE_KEY]: state
      })
    ).toEqual(state.starting);
  });

  it('selects for the success state', () => {
    expect(
      selectMoveComicsStateSuccess({
        [MOVE_COMICS_FEATURE_KEY]: state
      })
    ).toEqual(state.success);
  });
});
