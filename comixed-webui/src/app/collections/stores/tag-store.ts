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

import { CollectionEntry } from '@app/collections/models/collection-entry';
import { ComicTagType } from '@app/library/models/comic-tag-type';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

interface TagState {
  tagType: ComicTagType;
  entries: CollectionEntry[];
  total: number;
  index: number;
  size: number;
  searchText: string;
  sortBy: string;
  sortDirection: string;
}

const initialState: TagState = {
  tagType: ComicTagType.OTHER,
  entries: [],
  total: 0,
  searchText: '',
  index: 0,
  size: 10,
  sortBy: '',
  sortDirection: ''
};

export const TagStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    setTagType(tagType: ComicTagType): void {
      patchState(store, { tagType });
    },
    update(entries: CollectionEntry[], total: number): void {
      patchState(store, {
        entries,
        total
      });
    }
  }))
);
