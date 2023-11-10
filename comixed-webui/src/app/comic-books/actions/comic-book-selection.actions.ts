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

import { createAction, props } from '@ngrx/store';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { TagType } from '@app/collections/models/comic-collection.enum';

export const loadComicBookSelections = createAction(
  '[Comic Book Selection] Loads the initial set of comic book selections'
);

export const comicBookSelectionsLoaded = createAction(
  '[Comic Book Selection] The initial set of comic book selects were loaded',
  props<{
    ids: number[];
  }>()
);

export const loadComicBookSelectionsFailed = createAction(
  '[Comic Book Select] Failed to load the initial set of comic book selectsion'
);

export const comicBookSelectionUpdate = createAction(
  '[Comic Book Selection] The current set of selected comic book is',
  props<{
    ids: number[];
  }>()
);

export const clearComicBookSelectionState = createAction(
  '[Comic Book Selection] Clear the comic book selection state'
);

export const comicBookSelectionStateCleared = createAction(
  '[Comic Book Selection] The comic book selection state was cleared'
);

export const clearComicBookSelectionStateFailed = createAction(
  '[Comic Book Selection] Failed to clear the comic book selection state'
);

export const addSingleComicBookSelection = createAction(
  '[Comic Book Selection] Adds a single comic book selection',
  props<{ comicBookId: number }>()
);

export const removeSingleComicBookSelection = createAction(
  '[Comic Book Selection] Removes a single comic book selection',
  props<{ comicBookId: number }>()
);

export const singleComicBookSelectionUpdated = createAction(
  '[Comic Book Selection] The selected state for a single comic book was set'
);

export const singleComicBookSelectionFailed = createAction(
  '[Comic Book Selection] Failed to set the selected state for a single comic book'
);

export const setMultipleComicBookByFilterSelectionState = createAction(
  '[Comic Book Selection] Set the selected state for multiple comic books using a filter',
  props<{
    coverYear: number;
    coverMonth: number;
    archiveType: ArchiveType;
    comicType: ComicType;
    comicState: ComicState;
    unscrapedState: boolean;
    searchText: string;
    selected: boolean;
  }>()
);

export const setMultipleComicBooksByTagTypeAndValueSelectionState =
  createAction(
    '[Comic Book Selection] Set the selected state for multiple comic books by tag type and value',
    props<{
      tagType: TagType;
      tagValue: string;
      selected: boolean;
    }>()
  );

export const setMultipleComicBookByIdSelectionState = createAction(
  '[Comic Book Selection] Set the selected state for multiple comic books by id',
  props<{
    comicBookIds: number[];
    selected: boolean;
  }>()
);

export const setMultipleComicBookSelectionStateSuccess = createAction(
  '[Comic Book Selection] The selected state for multiple comic books was set'
);

export const setMultipleComicBookSelectionStateFailure = createAction(
  '[Comic Book Selection] Failed to set the selected state for multiple comic books'
);
