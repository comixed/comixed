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
  pageBlockSet,
  setPageBlock,
  setPageBlockFailed
} from '../actions/blocked-page.actions';

export const BLOCKED_PAGE_FEATURE_KEY = 'blocked_page_state';

export interface BlockedPageState {
  saving: boolean;
}

export const initialState: BlockedPageState = {
  saving: false
};

export const reducer = createReducer(
  initialState,

  on(setPageBlock, state => ({ ...state, saving: true })),
  on(pageBlockSet, state => ({ ...state, saving: false })),
  on(setPageBlockFailed, state => ({ ...state, saving: false }))
);
