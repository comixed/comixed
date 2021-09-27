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
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';

export const loadBlockedHashList = createAction(
  '[Blocked Hash List] Loads the blocked page list'
);

export const blockedHashListLoaded = createAction(
  '[Blocked Hash List] Blocked page list loaded',
  props<{ entries: BlockedHash[] }>()
);

export const loadBlockedHashListFailed = createAction(
  '[Blocked Hash List] Loading the blocked page list failed'
);

export const blockedHashUpdated = createAction(
  '[Blocked Hash List] An updated entry was received',
  props<{ entry: BlockedHash }>()
);

export const blockedHashRemoved = createAction(
  '[Blocked Hash List] A blocked page was removed',
  props<{ entry: BlockedHash }>()
);
export const markPagesWithHash = createAction(
  '[Blocked Hash List] Set the deleted flag for multiple pages',
  props<{ hashes: string[]; deleted: boolean }>()
);
export const pagesWithHashMarked = createAction(
  '[Blocked Hash List] The deleted flag set for multiple pages'
);
export const markPagesWithHashFailed = createAction(
  '[Blocked Hash List] Failed to set the deleted flag for multiple pages'
);
