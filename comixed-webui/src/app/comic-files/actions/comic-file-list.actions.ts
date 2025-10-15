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
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';

export const loadComicFilesFromSession = createAction('[Comic File List]');

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

export const toggleComicFileSelections = createAction(
  '[Comic File List] Toggle comic file selections',
  props<{
    filename: string;
    selected: boolean;
  }>()
);

export const toggleComicFileSelectionsSuccess = createAction(
  '[Comic File List] Successfully toggled comic file selections',
  props<{
    groups: ComicFileGroup[];
  }>()
);

export const toggleComicFileSelectionsFailure = createAction(
  '[Comic File List] Failed to toggle comic file selections'
);
