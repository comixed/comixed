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
import { Page } from '../../library';

export const resetBlockedPageHashes = createAction(
  '[Blocked Page Hashes] Reset the blocked page hash state'
);

export const blockedPageHashesLoaded = createAction(
  '[Blocked Page Hashes] Blocked page hashes loaded',
  props<{ hashes: string[] }>()
);

export const setPageBlock = createAction(
  '[Blocked Page Hashes] Sets the blocked state for a page',
  props<{ page: Page; blocked: boolean }>()
);

export const pageBlockSet = createAction(
  '[Blocked Page Hashes] Blocked state for a page was set'
);

export const setPageBlockFailed = createAction(
  '[Blocked Page Hashes] Failed to set the blocked state for a page'
);
