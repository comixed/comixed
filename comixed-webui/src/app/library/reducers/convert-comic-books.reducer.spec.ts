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
  ConvertComicBooksState,
  initialState,
  reducer
} from './convert-comic-books.reducer';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import {
  convertComicBooksFailure,
  convertComicBooksSuccess,
  convertSelectedComicBooks,
  convertSingleComicBook
} from '@app/library/actions/convert-comic-books.actions';

describe('ConvertComicBooks Reducer', () => {
  const COMIC_DETAILS = [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5];
  const COMIC_DETAIL = COMIC_DETAILS[0];
  const ARCHIVE_TYPE = ArchiveType.CBZ;
  const RENAME_PAGES = Math.random() > 0.5;
  const DELETE_PAGES = Math.random() > 0.5;

  let state: ConvertComicBooksState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the converting state', () => {
      expect(state.converting).toBeFalse();
    });
  });

  describe('converting a single comic book', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, converting: false },
        convertSingleComicBook({
          comicDetail: COMIC_DETAIL,
          archiveType: ARCHIVE_TYPE,
          deletePages: DELETE_PAGES,
          renamePages: RENAME_PAGES
        })
      );
    });

    it('sets the converting state', () => {
      expect(state.converting).toBeTrue();
    });
  });

  describe('converting selected comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, converting: false },
        convertSelectedComicBooks({
          archiveType: ARCHIVE_TYPE,
          deletePages: DELETE_PAGES,
          renamePages: RENAME_PAGES
        })
      );
    });

    it('sets the converting state', () => {
      expect(state.converting).toBeTrue();
    });
  });

  describe('success', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, converting: true },
        convertComicBooksSuccess()
      );
    });

    it('clears the converting state', () => {
      expect(state.converting).toBeFalse();
    });
  });

  describe('failure', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, converting: true },
        convertComicBooksFailure()
      );
    });

    it('clears the converting state', () => {
      expect(state.converting).toBeFalse();
    });
  });
});
