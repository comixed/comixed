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
import { ReadingList } from '@app/lists/models/reading-list';

export const loadReadingLists = createAction(
  '[Reading Lists] Load all reading lists for the current user'
);

export const readingListsLoaded = createAction(
  '[Reading Lists] All reading lists for current user loaded',
  props<{ entries: ReadingList[] }>()
);

export const loadReadingListsFailed = createAction(
  '[Reading Lists] Failed to load all reading lists for the current user'
);
