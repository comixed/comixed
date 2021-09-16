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
  downloadReadingList,
  downloadReadingListFailed,
  readingListDownloaded
} from '../actions/download-reading-list.actions';

export const DOWNLOAD_READING_LIST_FEATURE_KEY = 'download_reading_list_state';

export interface DownloadReadingListState {
  downloading: boolean;
}

export const initialState: DownloadReadingListState = {
  downloading: false
};

export const reducer = createReducer(
  initialState,

  on(downloadReadingList, state => ({ ...state, downloading: true })),
  on(readingListDownloaded, state => ({ ...state, downloading: false })),
  on(downloadReadingListFailed, state => ({ ...state, downloading: false }))
);
