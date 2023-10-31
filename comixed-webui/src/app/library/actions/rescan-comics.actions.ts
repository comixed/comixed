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

export const rescanSingleComicBook = createAction(
  '[Rescan Comic Books] Rescan a single comic book',
  props<{
    comicBookId: number;
  }>()
);

export const rescanSelectedComicBooks = createAction(
  '[Rescan Comic Books] Rescan selected comic books'
);

export const rescanComicBooksSuccess = createAction(
  '[Rescan Comic Books] Rescanning comic books has started'
);

export const rescanComicBooksFailure = createAction(
  '[Rescan Comic Books] Failed to start rescanning comic books'
);
