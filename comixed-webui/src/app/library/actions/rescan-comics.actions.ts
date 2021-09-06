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
import { Comic } from '@app/comic-book/models/comic';

export const rescanComics = createAction(
  '[Rescan Comics] Rescan selected comics',
  props<{ comics: Comic[] }>()
);

export const comicsRescanning = createAction(
  '[Rescan Comics] Rescanning comics has started'
);

export const rescanComicsFailed = createAction(
  '[Rescan Comics] Failed to start rescanning comics'
);
