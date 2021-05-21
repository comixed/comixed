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

import { createReducer, on } from '@ngrx/store';
import {
  comicInfoUpdated,
  updateComicInfo,
  updateComicInfoFailed
} from '../actions/update-comic-info.actions';

export const UPDATE_COMIC_INFO_FEATURE_KEY = 'update_comic_info_state';

export interface UpdateComicInfoState {
  updating: boolean;
}

export const initialState: UpdateComicInfoState = {
  updating: false
};

export const reducer = createReducer(
  initialState,

  on(updateComicInfo, state => ({ ...state, updating: true })),
  on(comicInfoUpdated, state => ({ ...state, updating: false })),
  on(updateComicInfoFailed, state => ({ ...state, updating: false }))
);
