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
import { LastRead } from '@app/last-read';

export const resetLastReadDates = createAction(
  '[Last Read List] Resets the feature state'
);

export const loadLastReadDates = createAction(
  '[Last Read List] Load a block of last read dates',
  props<{ lastId: number }>()
);

export const lastReadDatesLoaded = createAction(
  '[Last Read List] Received a block of last read dates',
  props<{ entries: LastRead[]; lastPayload: boolean }>()
);

export const lastReadDateUpdated = createAction(
  '[Last Read List] Received an updated last read date',
  props<{ entry: LastRead }>()
);

export const lastReadDateRemoved = createAction(
  '[Last Read List] Received a last read date removal',
  props<{ entry: LastRead }>()
);

export const loadLastReadDatesFailed = createAction(
  '[Last Read List] Loading a block of last read dates failed'
);
