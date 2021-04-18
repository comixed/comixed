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

import { createReducer, on } from '@ngrx/store';
import {
  blockedPagesDownloaded,
  downloadBlockedPages,
  downloadBlockedPagesFailed
} from '../actions/download-blocked-pages.actions';

export const DOWNLOAD_BLOCKED_PAGES_FEATURE_KEY =
  'download_blocked_pages_state';

export interface DownloadBlockedPagesState {
  downloading: boolean;
}

export const initialState: DownloadBlockedPagesState = {
  downloading: false
};

export const reducer = createReducer(
  initialState,

  on(downloadBlockedPages, state => ({ ...state, downloading: true })),
  on(blockedPagesDownloaded, state => ({ ...state, downloading: false })),
  on(downloadBlockedPagesFailed, state => ({ ...state, downloading: false }))
);
