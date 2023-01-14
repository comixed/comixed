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
  ConvertComicsState,
  initialState,
  reducer
} from './convert-comics.reducer';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import {
  comicsConverting,
  convertComics,
  convertComicsFailed
} from '@app/library/actions/convert-comics.actions';

describe('ConvertComics Reducer', () => {
  const COMICS = [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5];
  const ARCHIVE_TYPE = ArchiveType.CBZ;
  const RENAME_PAGES = Math.random() > 0.5;
  const DELETE_PAGES = Math.random() > 0.5;

  let state: ConvertComicsState;

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

  describe('converting comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, converting: false },
        convertComics({
          comicBooks: COMICS,
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
      state = reducer({ ...state, converting: true }, comicsConverting());
    });

    it('clears the converting state', () => {
      expect(state.converting).toBeFalse();
    });
  });

  describe('failure', () => {
    beforeEach(() => {
      state = reducer({ ...state, converting: true }, convertComicsFailed());
    });

    it('clears the converting state', () => {
      expect(state.converting).toBeFalse();
    });
  });
});
