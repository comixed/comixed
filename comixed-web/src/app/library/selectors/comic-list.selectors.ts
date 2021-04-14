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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  COMIC_LIST_FEATURE_KEY,
  ComicListState
} from '../reducers/comic-list.reducer';
import { CollectionType } from '@app/collections/models/comic-collection.enum';
import { Comic } from '@app/library';
import { CollectionListProperties } from '@app/collections/models/collection-list-properties';
import { CollectionListEntry } from '@app/collections/models/collection-list-entry';

export const selectComicListState = createFeatureSelector<ComicListState>(
  COMIC_LIST_FEATURE_KEY
);

export const selectComicList = createSelector(
  selectComicListState,
  state => state.comics
);

export const selectComicListCount = createSelector(
  selectComicListState,
  state => state.comics.length
);

export const selectComicListReadCount = createSelector(
  selectComicListState,
  state => state.comics.filter(comic => !!comic.lastRead).length
);

export const selectComicListDeletedCount = createSelector(
  selectComicListState,
  state => state.comics.filter(comic => !!comic.deletedDate).length
);

export const selectComicListCollection = createSelector(
  selectComicList,
  (state: Comic[], props: CollectionListProperties) => {
    let entries = [];
    state.forEach(comic => {
      switch (props.collectionType) {
        case CollectionType.PUBLISHERS:
          entries.push(comic.publisher);
          break;
        case CollectionType.SERIES:
          entries.push(comic.series);
          break;
        case CollectionType.CHARACTERS:
          entries = entries.concat(comic.characters);
          break;
        case CollectionType.TEAMS:
          entries = entries.concat(comic.teams);
          break;
        case CollectionType.LOCATIONS:
          entries = entries.concat(comic.locations);
          break;
        case CollectionType.STORIES:
          entries = entries.concat(comic.storyArcs);
          break;
      }
    });

    return entries
      .filter((entry, index, self) => self.indexOf(entry) === index)
      .map(name => {
        return {
          name,
          comicCount: entries.filter(entry => entry === name).length
        } as CollectionListEntry;
      });
  }
);
