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
  COMIC_METADATA_SOURCE_1,
  COMIC_TAG_1,
  COMIC_TAG_2,
  COMIC_TAG_3,
  COMIC_TAG_4,
  COMIC_TAG_5,
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2
} from '@app/comic-books/comic-books.fixtures';
import {
  comicBookLoaded,
  comicBookUpdated,
  downloadComicBook,
  downloadComicBookFailure,
  downloadComicBookSuccess,
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
import {
  PAGE_1,
  PAGE_2,
  PAGE_3,
  PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';

describe('ComicBook Reducer', () => {
  const COMIC = COMIC_BOOK_2;
  const DETAILS = DISPLAYABLE_COMIC_1;
  const METADATA = COMIC_METADATA_SOURCE_1;
  const PAGES = [PAGE_1, PAGE_2, PAGE_3, PAGE_4];
  const TAGS = [
    COMIC_TAG_1,
    COMIC_TAG_2,
    COMIC_TAG_3,
    COMIC_TAG_4,
    COMIC_TAG_5
  ];
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

    it('has no details', () => {
      expect(state.details).toBeNull();
    });

    it('has no metadata', () => {
      expect(state.metadata).toBeNull();
    });

    it('has no pages', () => {
      expect(state.pages).toEqual([]);
    });

    it('has no tags', () => {
      expect(state.tags).toEqual([]);
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
        {
          ...state,
          details: DETAILS,
          metadata: METADATA,
          pages: PAGES,
          loading: false
        },
        loadComicBook({ id: DETAILS.comicBookId })
      );
    });

    it('clears the details', () => {
      expect(state.details).toBeNull();
    });

    it('clears the metadata', () => {
      expect(state.metadata).toBeNull();
    });

    it('claers the pages', () => {
      expect(state.pages).toEqual([]);
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            loading: true,
            details: null,
            metadata: null,
            pages: [],
            tags: []
          },
          comicBookLoaded({
            details: DETAILS,
            metadata: METADATA,
            pages: PAGES,
            tags: TAGS
          })
        );
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });

      it('sets the details', () => {
        expect(state.details).toEqual(DETAILS);
      });

      it('sets the metadata', () => {
        expect(state.metadata).toEqual(METADATA);
      });

      it('sets the pages', () => {
        expect(state.pages).toEqual(PAGES);
      });

      it('sets the tags', () => {
        expect(state.tags).toEqual(TAGS);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, loading: true }, loadComicBookFailed());
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('updating a single comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false, saved: true },
        updateComicBook({
          comicBookId: DETAILS.comicBookId,
          publisher: DETAILS.publisher,
          series: DETAILS.series,
          volume: DETAILS.volume,
          issueNumber: DETAILS.issueNumber
        })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });

    describe('success', () => {
      const UPDATED_DETAILS = {
        ...DETAILS,
        filename: DETAILS.filename.substr(1)
      };
      const UPDATED_METADATA = {
        ...METADATA,
        referenceId: METADATA.referenceId.substr(1)
      };
      const UPDATED_PAGES = PAGES.reverse();

      beforeEach(() => {
        state = reducer(
          {
            ...state,
            saving: true,
            saved: false,
            details: DETAILS,
            metadata: METADATA,
            pages: PAGES
          },
          comicBookUpdated({
            details: UPDATED_DETAILS,
            metadata: UPDATED_METADATA,
            pages: UPDATED_PAGES
          })
        );
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });

      it('sets the saved flag', () => {
        expect(state.saved).toBeTrue();
      });

      it('updates the details', () => {
        expect(state.details).toEqual(UPDATED_DETAILS);
      });

      it('updates the metadata', () => {
        expect(state.metadata).toEqual(UPDATED_METADATA);
      });

      it('updates the pages', () => {
        expect(state.pages).toEqual(UPDATED_PAGES);
      });
    });

    describe('update received for different comic', () => {
      const OTHER_DETAILS = DISPLAYABLE_COMIC_2;
      const OTHER_METADATA = { ...METADATA, referenceId: 'OICU812' };
      const OTHER_PAGES = PAGES.reverse();

      beforeEach(() => {
        state = reducer(
          {
            ...state,
            saving: true,
            saved: false,
            details: DETAILS,
            metadata: METADATA,
            pages: PAGES
          },
          comicBookUpdated({
            details: OTHER_DETAILS,
            metadata: OTHER_METADATA,
            pages: OTHER_PAGES
          })
        );
      });

      it('does not affect the current details', () => {
        expect(state.details).toEqual(DETAILS);
      });

      it('does not affect the current metadata', () => {
        expect(state.metadata).toEqual(METADATA);
      });

      it('does not affect the current pages', () => {
        expect(state.pages).toEqual(PAGES);
      });

      it('does not change the saving flag', () => {
        expect(state.saving).toBeTrue();
      });

      it('does not change the saved flag', () => {
        expect(state.saved).toBeFalse();
      });
    });

    describe('failure', () => {
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

    describe('success', () => {
      beforeEach(() => {
        state = reducer({ ...state, saving: true }, pageDeletionUpdated());
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, saving: true }, updatePageDeletionFailed());
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });
    });
  });

  describe('saving the page order', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        savePageOrder({
          comicBookId: DETAILS.comicBookId,
          entries: [{ index: 0, filename: PAGE.filename }]
        })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer({ ...state, saving: true }, pageOrderSaved());
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, saving: true }, savePageOrderFailed());
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });
    });
  });

  describe('downloading a comic book file', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        downloadComicBook({ comicBookId: DETAILS.comicBookId })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true },
          downloadComicBookSuccess()
        );
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true },
          downloadComicBookFailure()
        );
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });
    });
  });
});
