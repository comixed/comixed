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

import { ComicBookState, initialState, reducer } from './comic-book.reducer';
import {
  COMIC_BOOK_2,
  COMIC_BOOK_4
} from '@app/comic-books/comic-books.fixtures';
import {
  comicBookLoaded,
  comicBookUpdated,
  loadComicBook,
  loadComicBookFailed,
  pageDeletionUpdated,
  pageOrderSaved,
  savePageOrder,
  savePageOrderFailed,
  updateComicBook,
  updateComicBookFailed,
  updatePageDeletion,
  updatePageDeletionFailed
} from '@app/comic-books/actions/comic-book.actions';
import { PAGE_1 } from '@app/comic-pages/comic-pages.fixtures';

describe('ComicBook Reducer', () => {
  const COMIC = COMIC_BOOK_2;
  const PAGE = PAGE_1;
  const DELETED = Math.random() > 0.5;

  let state: ComicBookState;

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

    it('has no comic', () => {
      expect(state.comicBook).toBeNull();
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('loading a single comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComicBook({ id: COMIC.id })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving a single comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, comicBook: null },
        comicBookLoaded({ comicBook: COMIC })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the comic', () => {
      expect(state.comicBook).toEqual(COMIC);
    });
  });

  describe('failure to load a single comic', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadComicBookFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('updating a single comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false, saved: true },
        updateComicBook({ comicBook: COMIC })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('successfully updating a single comic', () => {
    const UPDATED_COMIC = {
      ...COMIC,
      filename: COMIC.detail.filename.substr(1)
    };

    beforeEach(() => {
      state = reducer(
        { ...state, saving: true, saved: false, comicBook: COMIC },
        comicBookUpdated({ comicBook: UPDATED_COMIC })
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('sets the saved flag', () => {
      expect(state.saved).toBeTrue();
    });

    it('updates the comic', () => {
      expect(state.comicBook).toEqual(UPDATED_COMIC);
    });
  });

  describe('update received for different comic', () => {
    const CURRENT_COMIC = COMIC_BOOK_2;
    const OTHER_COMIC = COMIC_BOOK_4;

    beforeEach(() => {
      state = reducer(
        { ...state, saving: true, saved: false, comicBook: CURRENT_COMIC },
        comicBookUpdated({ comicBook: OTHER_COMIC })
      );
    });

    it('does not affect the current comic', () => {
      expect(state.comicBook).toEqual(CURRENT_COMIC);
    });

    it('does not change the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    it('does not change the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('failure to update a single comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: true, saved: true },
        updateComicBookFailed()
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('setting the deleted state for pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        updatePageDeletion({ pages: [PAGE], deleted: DELETED })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });
  });

  describe('success setting the deleted state', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, pageDeletionUpdated());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('failure setting the deleted state', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, updatePageDeletionFailed());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('saving the page order', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        savePageOrder({
          comicBook: COMIC,
          entries: [{ index: 0, filename: PAGE.filename }]
        })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });
  });

  describe('page order saved', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, pageOrderSaved());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('save page order failed', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, savePageOrderFailed());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });
});
