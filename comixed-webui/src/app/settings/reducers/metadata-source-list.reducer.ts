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
import { MetadataSource } from '@app/settings/models/metadata-source';
import { MetadataSourceListActions } from '@app/settings/actions/metadata-source-list.actions';

export const METADATA_SOURCE_LIST_FEATURE_KEY = 'metadata_source_list_State';

export interface MetadataSourceListState extends EntityState<MetadataSource> {
  busy: boolean;
  selected: MetadataSource | null;
}

export const metadataSourceListAdapter: EntityAdapter<MetadataSource> =
  createEntityAdapter<MetadataSource>({
    selectId: source => source.name,
    sortComparer: (left, right) => left.name.localeCompare(right.name)
  });

export const initialMetadataSourceListState: MetadataSourceListState =
  metadataSourceListAdapter.getInitialState({
    busy: false,
    selected: null
  });

export const metadataSourceListReducer = createReducer(
  initialMetadataSourceListState,
  on(MetadataSourceListActions.setSelected, (state, action) => ({
    ...state,
    selected: action.selected
  })),
  on(MetadataSourceListActions.load, state => ({ ...state, busy: true })),
  on(MetadataSourceListActions.loadSuccess, (state, action) => {
    return metadataSourceListAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      selected: action.entries.find(entry => entry.preferred) || null
    });
  }),
  on(MetadataSourceListActions.loadFailure, state => ({
    ...state,
    busy: false
  })),
  on(MetadataSourceListActions.save, state => ({ ...state, busy: true })),
  on(MetadataSourceListActions.saveSuccess, (state, action) => {
    return metadataSourceListAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      selected: action.entries.find(entry => entry.preferred) || null
    });
  }),
  on(MetadataSourceListActions.saveFailure, state => ({
    ...state,
    busy: false
  }))
);

export const metadataSourceListsFeature = createFeature({
  name: METADATA_SOURCE_LIST_FEATURE_KEY,
  reducer: metadataSourceListReducer
});
