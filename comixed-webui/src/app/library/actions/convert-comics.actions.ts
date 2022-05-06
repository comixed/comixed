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
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';

export const convertComics = createAction(
  '[Convert Comics] Convert comics',
  props<{
    comicBooks: ComicBook[];
    archiveType: ArchiveType;
    deletePages: boolean;
    renamePages: boolean;
  }>()
);

export const comicsConverting = createAction(
  '[Convert Comics] Conversion process started'
);

export const convertComicsFailed = createAction(
  '[Convert Comics] Failed to start converting comics'
);
