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
  DownloadBlockedPagesState,
  initialState,
  reducer
} from './download-blocked-pages.reducer';
import {
  blockedPagesDownloaded,
  downloadBlockedPages,
  downloadBlockedPagesFailed
} from '@app/blocked-pages/actions/download-blocked-pages.actions';
import { BLOCKED_PAGE_FILE } from '@app/blocked-pages/blocked-pages.fixtures';

describe('DownloadBlockedPages Reducer', () => {
  const FILE = BLOCKED_PAGE_FILE;

  let state: DownloadBlockedPagesState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the downloading flag', () => {
      expect(state.downloading).toBeFalse();
    });
  });

  describe('downloading the blocked pages list', () => {
    beforeEach(() => {
      state = reducer({ ...state, downloading: false }, downloadBlockedPages());
    });

    it('sets the downloading flag', () => {
      expect(state.downloading).toBeTrue();
    });
  });

  describe('successfully downloading the blocked pages list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, downloading: true },
        blockedPagesDownloaded({ document: BLOCKED_PAGE_FILE })
      );
    });

    it('clears the downloading flag', () => {
      expect(state.downloading).toBeFalse();
    });
  });

  describe('failure downloading the blocked pages list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, downloading: true },
        downloadBlockedPagesFailed()
      );
    });

    it('clears the downloading flag', () => {
      expect(state.downloading).toBeFalse();
    });
  });
});
