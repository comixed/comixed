/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  RunLibraryPluginState
} from './run-library-plugin.reducer';
import {
  runLibraryPluginFailure,
  runLibraryPluginOnOneComicBook,
  runLibraryPluginOnSelectedComicBooks,
  runLibraryPluginSuccess
} from '@app/library-plugins/actions/run-library-plugin.actions';
import { LIBRARY_PLUGIN_4 } from '@app/library-plugins/library-plugins.fixtures';
import { COMIC_BOOK_2 } from '@app/comic-books/comic-books.fixtures';

describe('RunLibraryPlugin Reducer', () => {
  const PLUGIN = LIBRARY_PLUGIN_4;
  const COMIC_BOOK = COMIC_BOOK_2;

  let state: RunLibraryPluginState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('running a library plugin', () => {
    describe('for a single comic book', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: false },
          runLibraryPluginOnOneComicBook({
            plugin: PLUGIN,
            comicBookId: COMIC_BOOK.id
          })
        );
      });

      it('sets the busy flag', () => {
        expect(state.busy).toBeTrue();
      });
    });

    describe('for all selected comic books', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: false },
          runLibraryPluginOnSelectedComicBooks({
            plugin: PLUGIN
          })
        );
      });

      it('sets the busy flag', () => {
        expect(state.busy).toBeTrue();
      });
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, runLibraryPluginSuccess());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, runLibraryPluginFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
