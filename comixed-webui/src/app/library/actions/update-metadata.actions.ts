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

import { createAction, props } from '@ngrx/store';

export const updateSingleComicBookMetadata = createAction(
  '[Update Metadata] Update the metadata for a single comic book',
  props<{
    comicBookId: number;
  }>()
);

export const updateSelectedComicBooksMetadata = createAction(
  '[Update Metadata] Update the metadata in the selected comic books'
);

export const updateSelectedComicBooksMetadataSuccess = createAction(
  '[Update Metadata] Updating metadata in comic books was started'
);

export const updateSelectedComicBooksMetadataFailure = createAction(
  '[Update Metadata] Failed to start updating metadata in comic books'
);
