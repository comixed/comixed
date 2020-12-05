/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { ComicFile } from '@app/library/models/comic-file';

export const loadComicFiles = createAction(
  '[ComicImport] Load comics in a file system',
  props<{ directory: string; maximum: number }>()
);
export const comicFilesLoaded = createAction(
  '[ComicImport] Loaded comics in a file system',
  props<{ files: ComicFile[] }>()
);
export const loadComicFilesFailed = createAction(
  '[ComicImport] Failed to load comic files in a file system'
);
export const setComicFilesSelectedState = createAction(
  '[ComicImport] Set the selected state on comic files',
  props<{ files: ComicFile[]; selected: boolean }>()
);
export const clearComicFileSelections = createAction(
  '[ComicImport] Clear all selected comic files'
);
export const sendComicFiles = createAction(
  '[ComicImport] Begin importing the selected comic files',
  props<{
    files: ComicFile[];
    ignoreMetadata: boolean;
    deleteBlockedPages: boolean;
  }>()
);
export const comicFilesSent = createAction(
  '[ComicImport] Importing comic files has started'
);
export const sendComicFilesFailed = createAction(
  '[ComicImport] Failed to begin importing comic files'
);
export const setImportingComicsState = createAction(
  '[ComicImport] Explicitly sets the importing state',
  props<{ importing: boolean }>()
);
