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

import {
  DownloadReadingListState,
  initialState,
  reducer
} from './download-reading-list.reducer';
import {
  downloadReadingList,
  downloadReadingListFailed,
  readingListDownloaded
} from '@app/lists/actions/download-reading-list.actions';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';

describe('DownloadReadingList Reducer', () => {
  const READING_LIST = READING_LIST_3;

  let state: DownloadReadingListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {});

    it('clears the download flag', () => {
      expect(state.downloading).toBeFalse();
    });
  });

  describe('downloading a reading list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, downloading: false },
        downloadReadingList({ list: READING_LIST })
      );
    });

    it('sets the download flag', () => {
      expect(state.downloading).toBeTrue();
    });
  });

  describe('success', () => {
    beforeEach(() => {
      state = reducer({ ...state, downloading: true }, readingListDownloaded());
    });

    it('clears the download flag', () => {
      expect(state.downloading).toBeFalse();
    });
  });

  describe('failure', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, downloading: true },
        downloadReadingListFailed()
      );
    });

    it('clears the download flag', () => {
      expect(state.downloading).toBeFalse();
    });
  });
});
