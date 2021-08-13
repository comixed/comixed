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

export const setBlockedPageDeletionFlags = createAction(
  '[Set Blocked Page Deletion Flag] Set the deletion flag for multiple pages',
  props<{ hashes: string[]; deleted: boolean }>()
);

export const blockedPageDeletionFlagsSet = createAction(
  '[Set Blocked Page Deletion Flag] The deletion flag set for multiple pages'
);

export const setBlockedPageDeletionFlagsFailed = createAction(
  '[Set Blocked Page Deletion Flag] Failed to set the deletion flag for multiple pages'
);
