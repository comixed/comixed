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
  COMIC_BOOK_LIST_FEATURE_KEY,
  ComicBookListState
} from '../reducers/comic-book-list.reducer';
import { CollectionType } from '@app/collections/models/comic-collection.enum';
import { CollectionListProperties } from '@app/collections/models/collection-list-properties';
import { CollectionListEntry } from '@app/collections/models/collection-list-entry';
import { ComicState } from '@app/comic-books/models/comic-state';
import { MISSING_VOLUME_PLACEHOLDER } from '@app/comic-books/comic-books.constants';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';

export const selectComicBookListState =
  createFeatureSelector<ComicBookListState>(COMIC_BOOK_LIST_FEATURE_KEY);

export const selectComicBookList = createSelector(
  selectComicBookListState,
  state => state.comicBooks
);

export const selectComicBookListCount = createSelector(
  selectComicBookListState,
  state => state.comicBooks.length
);

export const selectComicBookListDeletedCount = createSelector(
  selectComicBookListState,
  state =>
    state.comicBooks.filter(
      comicBook => comicBook.comicState === ComicState.DELETED
    ).length
);

export const selectComicBookListCollection = createSelector(
  selectComicBookList,
  (state: ComicDetail[], props: CollectionListProperties) => {
    let entries = [];
    state.forEach(comicBook => {
      switch (props.collectionType) {
        case CollectionType.PUBLISHERS:
          entries.push(comicBook.publisher || '[UNKNOWN]');
          break;
        case CollectionType.SERIES:
          entries.push(
            `${comicBook.series || '[UNKNOWN]'} v${
              comicBook.volume || MISSING_VOLUME_PLACEHOLDER
            }`
          );
          break;
        case CollectionType.CHARACTERS:
          entries = entries.concat(
            comicBook.tags
              .filter(tag => tag.type === ComicTagType.CHARACTER)
              .map(tag => tag.value)
          );
          break;
        case CollectionType.TEAMS:
          entries = entries.concat(
            comicBook.tags
              .filter(tag => tag.type === ComicTagType.TEAM)
              .map(tag => tag.value)
          );
          break;
        case CollectionType.LOCATIONS:
          entries = entries.concat(
            comicBook.tags
              .filter(tag => tag.type === ComicTagType.LOCATION)
              .map(tag => tag.value)
          );
          break;
        case CollectionType.STORIES:
          entries = entries.concat(
            comicBook.tags
              .filter(tag => tag.type === ComicTagType.STORY)
              .map(tag => tag.value)
          );
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
