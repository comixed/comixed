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
import { Comic } from '@app/library/models/comic';
import { PublisherComicListActions } from '@app/library/actions/publisher-comic-list.actions';

export const PUBLISHER_COMIC_LIST_FEATURE_KEY = 'publisher_comic_list_state';

export interface PublisherComicListState extends EntityState<Comic> {
  busy: boolean;
  coverMonthList: number[];
  coverYearList: number[];
  total: number;
  filteredTotal: number;
}

export const publisherComicListAdapter: EntityAdapter<Comic> =
  createEntityAdapter<Comic>({
    selectId: comic => comic.comicId,
    sortComparer: (left, right) => left.addedDate - right.addedDate
  });

export const initialPublisherComicListState: PublisherComicListState =
  publisherComicListAdapter.getInitialState({
    busy: false,
    coverMonthList: [],
    coverYearList: [],
    total: 0,
    filteredTotal: 0
  });

export const publisherComicListReducer = createReducer(
  initialPublisherComicListState,
  on(PublisherComicListActions.load, state => ({ ...state, busy: true })),
  on(PublisherComicListActions.loadSuccess, (state, action) => {
    return publisherComicListAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      coverMonthList: action.coverMonthList,
      coverYearListc: action.coverYearList,
      total: action.total,
      filteredTotal: action.filteredTotal
    });
  }),
  on(PublisherComicListActions.loadFailure, state => ({
    ...state,
    busy: false
  }))
);

export const publisherComicListsFeature = createFeature({
  name: PUBLISHER_COMIC_LIST_FEATURE_KEY,
  reducer: publisherComicListReducer
});
