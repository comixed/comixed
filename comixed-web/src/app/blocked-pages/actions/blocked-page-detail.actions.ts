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
import { BlockedPage } from '@app/blocked-pages/models/blocked-page';

export const loadBlockedPageByHash = createAction(
  '[Blocked Page] Load a blocked page',
  props<{ hash: string }>()
);

export const blockedPageLoaded = createAction(
  '[Blocked Page] A blocked page was loaded',
  props<{ entry: BlockedPage }>()
);

export const loadBlockedPageFailed = createAction(
  '[Blocked Page] Failed to load a blocked page'
);

export const saveBlockedPage = createAction(
  '[Blocked Page] Saving a blocked page',
  props<{ entry: BlockedPage }>()
);

export const blockedPageSaved = createAction(
  '[Blocked Page] Blocked page was saved',
  props<{ entry: BlockedPage }>()
);

export const saveBlockedPageFailed = createAction(
  '[Blocked Page] Saving to updated a blocked page'
);
