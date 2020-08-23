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

import { Action, createReducer, on } from '@ngrx/store';
import {
  comicsMoving,
  moveComics,
  moveComicsFailed
} from '../actions/move-comics.actions';

export const MOVE_COMICS_FEATURE_KEY = 'move_comics_state';

export interface MoveComicsState {
  starting: boolean;
  success: boolean;
}

export const initialState: MoveComicsState = {
  starting: false,
  success: false
};

const moveComicsReducer = createReducer(
  initialState,

  on(moveComics, state => ({ ...state, starting: true, success: false })),
  on(comicsMoving, state => ({ ...state, starting: false, success: true })),
  on(moveComicsFailed, state => ({ ...state, starting: false }))
);

export function reducer(state: MoveComicsState | undefined, action: Action) {
  return moveComicsReducer(state, action);
}
