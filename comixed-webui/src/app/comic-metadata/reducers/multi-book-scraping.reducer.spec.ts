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
  MultiBookScrapingState,
  reducer
} from './multi-book-scraping.reducer';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import {
  multiBookScrapeComic,
  multiBookScrapeComicFailure,
  multiBookScrapeComicSuccess,
  multiBookScrapingRemoveBook,
  multiBookScrapingRemoveBookFailure,
  multiBookScrapingRemoveBookSuccess,
  multiBookScrapingSetCurrentBook,
  startMultiBookScraping,
  startMultiBookScrapingFailure,
  startMultiBookScrapingSuccess
} from '@app/comic-metadata/actions/multi-book-scraping.actions';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { ISSUE_1 } from '@app/collections/collections.fixtures';
import { MultiBookScrapingProcessStatus } from '@app/comic-metadata/models/multi-book-scraping-process-status';

describe('MultiBookScraping Reducer', () => {
  const COMIC_BOOKS = [
    COMIC_BOOK_1,
    COMIC_BOOK_2,
    COMIC_BOOK_3,
    COMIC_BOOK_4,
    COMIC_BOOK_5
  ];
  const CURRENT_COMIC_BOOK =
    COMIC_BOOKS[Math.floor(Math.random() * COMIC_BOOKS.length)];
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const ISSUE_ID = ISSUE_1.issueNumber;
  const SKIP_CACHE = Math.random() > 0.5;

  let state: MultiBookScrapingState;

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

    it('resets the started flag', () => {
      expect(state.status).toEqual(MultiBookScrapingProcessStatus.SETUP);
    });

    it('has no list of comic books', () => {
      expect(state.comicBooks).toEqual([]);
    });

    it('has no current comic book', () => {
      expect(state.currentComicBook).toBeNull();
    });
  });

  describe('starting the multi-book scraping process', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, startMultiBookScraping());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            status: MultiBookScrapingProcessStatus.SETUP,
            comicBooks: [],
            currentComicBook: null
          },
          startMultiBookScrapingSuccess({ comicBooks: COMIC_BOOKS })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the status to started', () => {
        expect(state.status).toEqual(MultiBookScrapingProcessStatus.STARTED);
      });

      it('sets the list of comic details', () => {
        expect(state.comicBooks).toEqual(COMIC_BOOKS);
      });

      it('sets the current  comic detail', () => {
        expect(state.currentComicBook).toEqual(COMIC_BOOKS[0]);
      });

      describe('when there are no comic books', () => {
        beforeEach(() => {
          state = reducer(
            { ...state, status: MultiBookScrapingProcessStatus.STARTED },
            startMultiBookScrapingSuccess({ comicBooks: [] })
          );
        });

        it('sets the status to finished', () => {
          expect(state.status).toBe(MultiBookScrapingProcessStatus.FINISHED);
        });
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, status: MultiBookScrapingProcessStatus.SETUP },
          startMultiBookScrapingFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the status to erro', () => {
        expect(state.status).toEqual(MultiBookScrapingProcessStatus.ERROR);
      });
    });
  });

  describe('setting the current comic book', () => {
    const OLD_CURRENT = COMIC_BOOKS[0];
    const NEW_CURRENT = COMIC_BOOKS[1];

    beforeEach(() => {
      state = reducer(
        { ...state, currentComicBook: OLD_CURRENT },
        multiBookScrapingSetCurrentBook({ comicBook: NEW_CURRENT })
      );
    });

    it('updates the current comic book', () => {
      expect(state.currentComicBook).toBe(NEW_CURRENT);
    });
  });

  describe('removing a book from the process', () => {
    const UPDATED_COMIC_DETAILS = COMIC_BOOKS.filter(
      entry => entry.id != CURRENT_COMIC_BOOK.id
    );

    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        multiBookScrapingRemoveBook({ comicBook: CURRENT_COMIC_BOOK })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            comicBooks: COMIC_BOOKS,
            currentComicBook: null
          },
          multiBookScrapingRemoveBookSuccess({
            comicBooks: UPDATED_COMIC_DETAILS
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('updates the list of comic details', () => {
        expect(state.comicBooks).toEqual(UPDATED_COMIC_DETAILS);
      });

      it('sets the current  comic detail', () => {
        expect(state.currentComicBook).toEqual(UPDATED_COMIC_DETAILS[0]);
      });

      describe('when it was the last comic book', () => {
        beforeEach(() => {
          state = reducer(
            { ...state, status: MultiBookScrapingProcessStatus.STARTED },
            multiBookScrapeComicSuccess({ comicBooks: [] })
          );
        });

        it('sets the status to finished', () => {
          expect(state.status).toBe(MultiBookScrapingProcessStatus.FINISHED);
        });
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state }, multiBookScrapingRemoveBookFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('scraping a comic book', () => {
    const UPDATED_COMIC_BOOKS = COMIC_BOOKS.filter(
      entry => entry != CURRENT_COMIC_BOOK
    );

    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        multiBookScrapeComic({
          metadataSource: METADATA_SOURCE,
          comicBook: CURRENT_COMIC_BOOK,
          issueId: ISSUE_ID,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            comicBooks: COMIC_BOOKS,
            currentComicBook: null
          },
          multiBookScrapeComicSuccess({
            comicBooks: UPDATED_COMIC_BOOKS
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('updates the list of comic details', () => {
        expect(state.comicBooks).toEqual(UPDATED_COMIC_BOOKS);
      });

      it('sets the current  comic detail', () => {
        expect(state.currentComicBook).toEqual(UPDATED_COMIC_BOOKS[0]);
      });

      describe('when it was the last comic book', () => {
        beforeEach(() => {
          state = reducer(
            { ...state, status: MultiBookScrapingProcessStatus.STARTED },
            multiBookScrapingRemoveBookSuccess({ comicBooks: [] })
          );
        });

        it('sets the status to finished', () => {
          expect(state.status).toBe(MultiBookScrapingProcessStatus.FINISHED);
        });
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state }, multiBookScrapeComicFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
