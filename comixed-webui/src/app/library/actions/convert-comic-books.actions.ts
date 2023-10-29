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
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

export const convertSingleComicBook = createAction(
  '[Convert Comic Books] Convert a single comic book',
  props<{
    comicDetail: ComicDetail;
    archiveType: ArchiveType;
    deletePages: boolean;
    renamePages: boolean;
  }>()
);

export const convertSelectedComicBooks = createAction(
  '[Convert Comic Books] Convert comics',
  props<{
    archiveType: ArchiveType;
    deletePages: boolean;
    renamePages: boolean;
  }>()
);

export const convertComicBooksSuccess = createAction(
  '[Convert Comic Books] Conversion process started'
);

export const convertComicBooksFailure = createAction(
  '[Convert Comic Books] Failed to start converting comics'
);
