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

import { createReducer, on } from '@ngrx/store';
import {
  pageSizeSet,
  resetDisplayOptions,
  setPageSize
} from '../actions/display.actions';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';
import { getUserPreference } from '@app/user';

export const DISPLAY_FEATURE_KEY = 'display_state';

export interface DisplayState {
  pageSize: number;
}

export const initialState: DisplayState = {
  pageSize: DEFAULT_PAGE_SIZE
};

export const reducer = createReducer(
  initialState,

  on(resetDisplayOptions, (state, action) => {
    if (!!action.user) {
      return {
        ...state,
        pageSize: parseInt(
          getUserPreference(
            action.user.preferences,
            PAGE_SIZE_PREFERENCE,
            `${DEFAULT_PAGE_SIZE}`
          ),
          10
        )
      };
    } else {
      return { ...state, pageSize: DEFAULT_PAGE_SIZE };
    }
  }),
  on(setPageSize, (state, action) => ({ ...state, pageSize: action.size })),
  on(pageSizeSet, state => state)
);
