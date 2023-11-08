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
import { ComicFile } from '@app/comic-files/models/comic-file';
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';

export const loadComicFileLists = createAction(
  '[Comic File List] Load comics in a file system',
  props<{ directory: string; maximum: number }>()
);

export const loadComicFileListSuccess = createAction(
  '[Comic File List] Loaded comics in a file system',
  props<{ groups: ComicFileGroup[] }>()
);

export const loadComicFileListFailure = createAction(
  '[Comic File List] Failed to load comic files in a file system'
);

export const resetComicFileList = createAction(
  '[Comic File List] Clears the list of comic book files'
);

export const setComicFilesSelectedState = createAction(
  '[Comic File List] Set the selected state on comic files',
  props<{ files: ComicFile[]; selected: boolean }>()
);

export const clearComicFileSelections = createAction(
  '[Comic File List] Clear all selected comic files'
);
