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
import { Comic } from '@app/library';
/*
export class SaveComicDetails implements Action {
  readonly type = '[COMIC] Save changes to a comic';

  constructor(public payload: { comic: Comic }) {}
}

 */
export const saveComicDetails = createAction(
  '[COMIC] Save changes to a comic',
  props<{ comic: Comic }>()
);

export const comicSaved = createAction(
  '[COMIC] Changes to a comic were saved',
  props<{ comic: Comic }>()
);

export const saveComicDetailsFailed = createAction(
  '[COMIC] Failed to save changes to a comic'
);
