/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { CollectionEntry } from '@app/library/models/collection-entry';
import { TagListActions } from '@app/library/actions/tag-list.actions';

export const TAG_LIST_FEATURE_KEY = 'tag_list_state';

export interface TagListState extends EntityState<CollectionEntry> {
  busy: boolean;
  total: number;
}

export const tagListAdapter: EntityAdapter<CollectionEntry> =
  createEntityAdapter<CollectionEntry>({
    selectId: entry => entry.tagValue,
    sortComparer: (left, right) => left.tagValue.localeCompare(right.tagValue)
  });

export const initialTagListState: TagListState = tagListAdapter.getInitialState(
  {
    busy: false,
    total: 0
  }
);

export const tagListReducer = createReducer(
  initialTagListState,
  on(TagListActions.load, state => ({ ...state, busy: true })),
  on(TagListActions.loadSuccess, (state, action) => {
    return tagListAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      total: action.total
    });
  }),
  on(TagListActions.loadFailure, state => ({ ...state, busy: false }))
);

export const tagListsFeature = createFeature({
  name: TAG_LIST_FEATURE_KEY,
  reducer: tagListReducer
});
