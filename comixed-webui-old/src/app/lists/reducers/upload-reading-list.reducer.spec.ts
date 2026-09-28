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
  initialState,
  reducer,
  UploadReadingListState
} from './upload-reading-list.reducer';
import {
  readingListUploaded,
  uploadReadingList,
  uploadReadingListFailed
} from '@app/lists/actions/upload-reading-list.actions';

describe('UploadReadingList Reducer', () => {
  const FILE = {} as File;

  let state: UploadReadingListState;

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
        uploadReadingList({ file: FILE })
      );
    });

    it('sets the uploading flag', () => {
      expect(state.uploading).toBeTrue();
    });
  });

  describe('success', () => {
    beforeEach(() => {
      state = reducer({ ...state, uploading: true }, readingListUploaded());
    });

    it('clears the uploading flag', () => {
      expect(state.uploading).toBeFalse();
    });
  });

  describe('failure', () => {
    beforeEach(() => {
      state = reducer({ ...state, uploading: true }, uploadReadingListFailed());
    });

    it('clears the uploading flag', () => {
      expect(state.uploading).toBeFalse();
    });
  });
});
