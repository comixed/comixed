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
  reducer,
  initialState,
  UploadedBlockedPagesState
} from './upload-blocked-pages.reducer';
import {
  blockedPagesUploaded,
  uploadBlockedPages,
  uploadBlockedPagesFailed
} from '@app/comic-pages/actions/upload-blocked-pages.actions';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_3,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';

describe('UploadBlockedPages Reducer', () => {
  const FILE = {} as File;
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];

  let state: UploadedBlockedPagesState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the uploading flag', () => {
      expect(state.uploading).toBeFalse();
    });
  });

  describe('uploading a file', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, uploading: false },
        uploadBlockedPages({ file: FILE })
      );
    });

    it('sets the uploading flag', () => {
      expect(state.uploading).toBeTrue();
    });
  });

  describe('success uploading a file', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, uploading: true },
        blockedPagesUploaded({ entries: ENTRIES })
      );
    });

    it('clears the uploading flag', () => {
      expect(state.uploading).toBeFalse();
    });
  });

  describe('failure uploading a file', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, uploading: true },
        uploadBlockedPagesFailed()
      );
    });

    it('clears the uploading flag', () => {
      expect(state.uploading).toBeFalse();
    });
  });
});
