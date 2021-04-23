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
  comicReadStatusUpdated,
  updateComicReadStatus,
  updateComicReadStatusFailed
} from '../actions/update-read-status.actions';

export const UPDATE_READ_STATUS_FEATURE_KEY = 'update_read_status_state';

export interface UpdateReadStatusState {
  updating: boolean;
}

export const initialState: UpdateReadStatusState = {
  updating: false
};

export const reducer = createReducer(
  initialState,

  on(updateComicReadStatus, state => ({ ...state, updating: true })),
  on(comicReadStatusUpdated, state => ({ ...state, updating: false })),
  on(updateComicReadStatusFailed, state => ({ ...state, updating: false }))
);
