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
import { Comic } from '@app/comic-books/models/comic';

export const updateComics = createAction(
  '[Library] Library updates received',
  props<{ updated: Comic[]; removed: number[] }>()
);

export const selectComics = createAction(
  '[Library] Mark a set of comics as selected',
  props<{ comics: Comic[] }>()
);

export const deselectComics = createAction(
  '[Library] Unmark a set of comics as selected',
  props<{ comics: Comic[] }>()
);

export const setReadState = createAction(
  '[Library] Set the read state for comics',
  props<{ comics: Comic[]; read: boolean }>()
);

export const readStateSet = createAction(
  '[Library] Successfully set the read state for comics'
);

export const setReadStateFailed = createAction(
  '[Library] Failed to set the read state for comics'
);
