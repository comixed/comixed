/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

export const setReadComics = createAction(
  '[Read Comic Books] Set the list of read comic books',
  props<{
    entries: number[];
  }>()
);

export const resetReadComics = createAction(
  '[Read Comic Books] Resets the list of read comic books'
);

export const markSingleComicRead = createAction(
  '[Comic Book Read State] Update the read state for a single comic book',
  props<{
    comicId: number;
    read: boolean;
  }>()
);

export const markSelectedComicsRead = createAction(
  '[Comic Book Read State] Update the read state for selected comic books',
  props<{ read: boolean }>()
);

export const markSelectedComicsReadSuccess = createAction(
  '[Comic Book Read State] The read state for comic books were updated'
);

export const markSelectedComicsReadFailed = createAction(
  '[Comic Book Read State] Failed to update the read state for comic books'
);
