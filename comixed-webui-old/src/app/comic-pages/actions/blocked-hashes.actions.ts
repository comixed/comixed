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
import { DownloadDocument } from '@app/core/models/download-document';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';

export const loadBlockedHashList = createAction(
  '[Blocked Hashes] Loads the blocked page list'
);

export const loadBlockedHashListSuccess = createAction(
  '[Blocked Hashes] Blocked page list loaded',
  props<{ entries: BlockedHash[] }>()
);

export const loadBlockedHashListFailure = createAction(
  '[Blocked Hashes] Loading the blocked page list failed'
);

export const blockedHashUpdated = createAction(
  '[Blocked Hashes] An updated entry was received',
  props<{ entry: BlockedHash }>()
);

export const blockedHashRemoved = createAction(
  '[Blocked Hashes] A blocked page was removed',
  props<{ entry: BlockedHash }>()
);

export const loadBlockedHashDetail = createAction(
  '[Blocked Hashes] Load a blocked hash',
  props<{ hash: string }>()
);

export const loadBlockedHashDetailSuccess = createAction(
  '[Blocked Hashes] A blocked hash was loaded',
  props<{ entry: BlockedHash }>()
);

export const loadBlockedHashDetailFailure = createAction(
  '[Blocked Hashes] Failed to load a blocked hash'
);

export const saveBlockedHash = createAction(
  '[Blocked Hashes] Saving a blocked page',
  props<{ entry: BlockedHash }>()
);

export const saveBlockedHashSuccess = createAction(
  '[Blocked Hashes] Blocked page was saved',
  props<{ entry: BlockedHash }>()
);

export const saveBlockedHashFailure = createAction(
  '[Blocked Hashes] Saving to updated a blocked page'
);

export const markPagesWithHash = createAction(
  '[Blocked Hashes] Set the deleted flag for multiple pages',
  props<{ hashes: string[]; deleted: boolean }>()
);

export const markPagesWithHashSuccess = createAction(
  '[Blocked Hashes] The deleted flag set for multiple pages'
);

export const markPagesWithHashFailure = createAction(
  '[Blocked Hashes] Failed to set the deleted flag for multiple pages'
);

export const downloadBlockedHashesFile = createAction(
  '[Blocked Hashes] Downloads the blocked page list'
);

export const downloadBlockedHashesFileSuccess = createAction(
  '[Blocked Hashes] Blocked pages downloaded',
  props<{ document: DownloadDocument }>()
);

export const downloadBlockedHashesFileFailure = createAction(
  '[Blocked Hashes] Failed to download blocked pages'
);

export const uploadBlockedHashesFile = createAction(
  '[Blocked Hashes] Upload blocked hash file',
  props<{ file: File }>()
);

export const uploadBlockedHashesFileSuccess = createAction(
  '[Blocked Hashes] Blocked hashes file uploaded',
  props<{ entries: BlockedHash[] }>()
);

export const uploadBlockedHashesFileFailure = createAction(
  '[Blocked Hashes] Failed to upload blocked hashes file'
);

export const setBlockedStateForSelectedHashes = createAction(
  '[Block Hashes] Sets the blocked state for all selected page hashes',
  props<{ blocked: boolean }>()
);

export const setBlockedStateForHash = createAction(
  '[Block Hashes] Sets the blocked state for a page hash',
  props<{ hashes: string[]; blocked: boolean }>()
);

export const setBlockedStateForHashSuccess = createAction(
  '[Block Hashes] Successfully set the blocked state for a page hash'
);

export const setBlockedStateForHashFailue = createAction(
  '[Block Hashes] Failed to set the blocked state for a page hash'
);
