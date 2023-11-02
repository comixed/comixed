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
import { LastRead } from '@app/comic-books/models/last-read';

export const loadUnreadComicBookCount = createAction(
  '[Last Read List] Load the last read count'
);

export const loadUnreadComicBookCountSuccess = createAction(
  '[Last Read List] The last read count was loaded',
  props<{
    unreadCount: number;
  }>()
);

export const loadUnreadComicBookCountFailure = createAction(
  '[Last Read List] Failed to load the last read count'
);

export const updateUnreadComicBookCount = createAction(
  '[Last Read List] Updates the unread comic book count',
  props<{
    count: number;
  }>()
);

export const setLastReadList = createAction(
  '[Last Read List] Sets the current list of last read dates',
  props<{ entries: LastRead[] }>()
);

export const resetLastReadList = createAction(
  '[Last Read List] Resets the last read list'
);

export const lastReadDateUpdated = createAction(
  '[Last Read List] Received an updated last read date',
  props<{ entry: LastRead }>()
);

export const lastReadDateRemoved = createAction(
  '[Last Read List] Received a last read date removal',
  props<{ entry: LastRead }>()
);
