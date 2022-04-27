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

import { ComicListState, initialState, reducer } from './comic-list.reducer';
import {
  comicListRemovalReceived,
  comicListUpdateReceived,
  comicsReceived,
  loadComics,
  loadComicsFailed,
  resetComicList,
  setComicListFilter
} from '@app/comic-books/actions/comic-list.actions';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from '@app/comic-books/comic-books.fixtures';

describe('Comic List Reducer', () => {
  const LAST_ID = Math.floor(Math.abs(Math.random() * 1000));
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];

  let state: ComicListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('resets the last id', () => {
      expect(state.lastId).toEqual(0);
    });

    it('clears the last payload flag', () => {
      expect(state.lastPayload).toBeFalse();
    });

    it('has no comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('has no unprocessed comics', () => {
      expect(state.unprocessed).toEqual([]);
    });

    it('has no unscraped comics', () => {
      expect(state.unscraped).toEqual([]);
    });

    it('has no changed comics', () => {
      expect(state.changed).toEqual([]);
    });

    it('has no deleted comics', () => {
      expect(state.deleted).toEqual([]);
    });

    it('has no cover date filter', () => {
      expect(state.coverDateFilter).toEqual({ year: null, month: null });
    });
  });

  describe('resetting the comic state', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          lastId: LAST_ID,
          lastPayload: true,
          comics: [COMIC_1, COMIC_3, COMIC_5],
          unprocessed: [COMIC_1, COMIC_3, COMIC_5],
          unscraped: [COMIC_1, COMIC_3, COMIC_5],
          changed: [COMIC_1, COMIC_3, COMIC_5],
          deleted: [COMIC_1, COMIC_3, COMIC_5],
          coverDateFilter: { year: 2022, month: 4 }
        },
        resetComicList()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('resets the last id', () => {
      expect(state.lastId).toEqual(0);
    });

    it('clears the last payload flag', () => {
      expect(state.lastPayload).toBeFalse();
    });

    it('clears the existing set of comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('has no unprocessed comics', () => {
      expect(state.unprocessed).toEqual([]);
    });

    it('has no unscraped comics', () => {
      expect(state.unscraped).toEqual([]);
    });

    it('has no changed comics', () => {
      expect(state.changed).toEqual([]);
    });

    it('has no deleted comics', () => {
      expect(state.deleted).toEqual([]);
    });

    it('resets the cover date filter', () => {
      expect(state.coverDateFilter).toEqual({ year: null, month: null });
    });
  });

  describe('loading a batch of comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComics({ lastId: LAST_ID })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving a batch of comics', () => {
    const EXISTING_COMIC = COMICS[0];
    const UPDATED_COMIC = {
      ...EXISTING_COMIC,
      filename: EXISTING_COMIC.filename.substr(1)
    };
    const BATCH = [UPDATED_COMIC, COMIC_2, COMIC_4];
    const LAST_PAGE = Math.random() > 0.5;

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          lastId: 0,
          lastPayload: !LAST_PAGE,
          comics: COMICS
        },
        comicsReceived({
          comics: BATCH,
          lastId: LAST_ID,
          lastPayload: LAST_PAGE
        })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('updates the last id', () => {
      expect(state.lastId).toEqual(LAST_ID);
    });

    it('sets the last payload flag', () => {
      expect(state.lastPayload).toEqual(LAST_PAGE);
    });

    it('adds the received comics', () => {
      BATCH.every(comic => expect(state.comics).toContain(comic));
    });

    it('replaces existing comics', () => {
      expect(state.comics).not.toContain(EXISTING_COMIC);
      expect(state.comics).toContain(UPDATED_COMIC);
    });
  });

  describe('failure to load a batch of comics', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadComicsFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('receiving a new comic', () => {
    const EXISTING = COMIC_1;
    const NEW = COMIC_2;

    beforeEach(() => {
      state = reducer(
        { ...state, comics: [EXISTING] },
        comicListUpdateReceived({ comic: NEW })
      );
    });

    it('retains the existing comic', () => {
      expect(state.comics).toContain(EXISTING);
    });

    it('adds the new comic', () => {
      expect(state.comics).toContain(NEW);
    });
  });

  describe('updating an existing comic', () => {
    const EXISTING = COMIC_1;
    const UPDATED = { ...EXISTING, filename: EXISTING.filename.substr(1) };

    beforeEach(() => {
      state = reducer(
        { ...state, comics: [EXISTING] },
        comicListUpdateReceived({ comic: UPDATED })
      );
    });

    it('removes the existing comic', () => {
      expect(state.comics).not.toContain(EXISTING);
    });

    it('adds the updated comic', () => {
      expect(state.comics).toContain(UPDATED);
    });
  });

  describe('removing an existing comic', () => {
    const REMOVED = COMICS[0];

    beforeEach(() => {
      state = reducer(
        { ...state, comics: COMICS },
        comicListRemovalReceived({ comic: REMOVED })
      );
    });

    it('removes the comic', () => {
      expect(state.comics).not.toContain(REMOVED);
    });
  });

  describe('setting the cover date filter', () => {
    const MONTH = 4;
    const YEAR = 2022;

    beforeEach(() => {
      state = reducer(
        { ...state, coverDateFilter: { year: null, month: null } },
        setComicListFilter({ month: MONTH, year: YEAR })
      );
    });

    it('sets the cover date filter', () => {
      expect(state.coverDateFilter).toEqual({ year: YEAR, month: MONTH });
    });
  });
});
