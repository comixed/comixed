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
  clearBreadcrumbs,
  setBreadcrumbs
} from '../actions/breadcrumb.actions';
import { BreadcrumbEntry } from 'app/models/ui/breadcrumb-entry';

export const BREADCRUMB_FEATURE_KEY = 'breadcrumb_state';

export interface BreadcrumbState {
  entries: BreadcrumbEntry[];
}

export const initialState: BreadcrumbState = {
  entries: []
};

const breadcrumbReducer = createReducer(
  initialState,

  on(setBreadcrumbs, (state, action) => ({
    ...state,
    entries: action.entries
  })),
  on(clearBreadcrumbs, state => ({ ...state, entries: [] }))
);

export function reducer(state: BreadcrumbState | undefined, action: Action) {
  return breadcrumbReducer(state, action);
}
