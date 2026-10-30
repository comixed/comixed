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
import { SeriesComicListActions } from '@app/library/actions/series-comic-list.actions';
import { Issue } from '@app/library/models/issue';

export const SERIES_COMIC_LIST_FEATURE_KEY = 'series_comic_list_state';

export interface SeriesComicListState extends EntityState<Issue> {
  busy: boolean;
}

export const seriesComicListAdapter: EntityAdapter<Issue> =
  createEntityAdapter<Issue>({
    selectId: issue => issue.issueId,
    sortComparer: (left, right) => left.issueId - right.issueId
  });

export const initialSeriesComicListState: SeriesComicListState =
  seriesComicListAdapter.getInitialState({
    busy: false
  });

export const seriesComicListReducer = createReducer(
  initialSeriesComicListState,
  on(SeriesComicListActions.load, state => ({ ...state, busy: true })),
  on(SeriesComicListActions.loadSuccess, (state, action) => {
    return seriesComicListAdapter.setAll(action.entries, {
      ...state,
      busy: false
    });
  }),
  on(SeriesComicListActions.loadFailure, state => ({ ...state, busy: false }))
);

export const seriesComicListsFeature = createFeature({
  name: SERIES_COMIC_LIST_FEATURE_KEY,
  reducer: seriesComicListReducer
});
