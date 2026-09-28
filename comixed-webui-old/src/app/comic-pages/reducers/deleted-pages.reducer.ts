/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import * as DeletedPagesActions from '../actions/deleted-pages.actions';
import { DeletedPage } from '@app/comic-pages/models/deleted-page';

export const DELETED_PAGE_FEATURE_KEY = 'deleted_pages_state';

export interface DeletedPagesState {
  busy: boolean;
  list: DeletedPage[];
  current: DeletedPage;
}

export const initialState: DeletedPagesState = {
  busy: false,
  list: [],
  current: null
};

export const reducer = createReducer(
  initialState,

  on(DeletedPagesActions.loadDeletedPages, state => ({ ...state, busy: true })),
  on(DeletedPagesActions.deletedPagesLoaded, (state, action) => ({
    ...state,
    busy: false,
    list: action.pages
  })),
  on(DeletedPagesActions.loadDeletedPagesFailed, state => ({
    ...state,
    busy: false
  }))
);
