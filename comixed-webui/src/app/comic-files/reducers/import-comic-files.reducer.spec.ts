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
  ImportComicFilesState,
  initialState,
  reducer
} from './import-comic-files.reducer';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3
} from '@app/comic-files/comic-file.fixtures';
import {
  comicFilesSent,
  sendComicFiles,
  sendComicFilesFailed
} from '@app/comic-files/actions/import-comic-files.actions';

describe('ImportComicFiles Reducer', () => {
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];
  const SKIP_METADATA = Math.random() > 0.5;

  let state: ImportComicFilesState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalse();
    });
  });

  describe('sending comic files', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, sending: false },
        sendComicFiles({
          files: FILES,
          skipMetadata: SKIP_METADATA
        })
      );
    });

    it('sets the sending flag', () => {
      expect(state.sending).toBeTrue();
    });
  });

  describe('successfully sending files', () => {
    beforeEach(() => {
      state = reducer({ ...state, sending: true }, comicFilesSent());
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalse();
    });
  });

  describe('failure to send files', () => {
    beforeEach(() => {
      state = reducer({ ...state, sending: true }, sendComicFilesFailed());
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalse();
    });
  });
});
