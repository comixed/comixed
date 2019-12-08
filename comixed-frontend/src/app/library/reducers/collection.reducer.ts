/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import {
  CollectionActions,
  CollectionActionTypes
} from '../actions/collection.actions';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { CollectionEntry } from 'app/library/models/collection-entry';
import { Comic } from 'app/comics';

export const COLLECTION_FEATURE_KEY = 'collection';

export interface CollectionState {
  type: CollectionType;
  fetchingEntries: boolean;
  entries: CollectionEntry[];
  selected: CollectionEntry;
  fetchingEntry: boolean;
  page: number;
  comics: Comic[];
  comicCount: number;
}

export const initialState: CollectionState = {
  type: null,
  fetchingEntries: false,
  entries: [],
  selected: null,
  fetchingEntry: false,
  page: 0,
  comics: [],
  comicCount: 0
};

export function reducer(
  state = initialState,
  action: CollectionActions
): CollectionState {
  switch (action.type) {
    case CollectionActionTypes.Load:
      return { ...state, fetchingEntries: true, type: action.payload.collectionType };

    case CollectionActionTypes.Received:
      return {
        ...state,
        fetchingEntries: false,
        entries: action.payload.entries
      };

    case CollectionActionTypes.LoadFailed:
      return { ...state, fetchingEntries: false };

    case CollectionActionTypes.GetComics:
      return { ...state, fetchingEntry: true, page: action.payload.page };

    case CollectionActionTypes.ComicsReceived:
      return {
        ...state,
        fetchingEntry: false,
        comics: action.payload.comics,
        comicCount: action.payload.comicCount
      };

    case CollectionActionTypes.GetComicsFailed:
      return { ...state, fetchingEntry: false };

    default:
      return state;
  }
}
