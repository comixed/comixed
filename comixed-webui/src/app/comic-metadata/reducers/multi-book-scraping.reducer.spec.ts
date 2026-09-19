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
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import {
  batchScrapeComicBooks,
  batchScrapeComicBooksFailure,
  batchScrapeComicBooksSuccess,
  loadMultiBookScrapingPage,
  loadMultiBookScrapingPageFailure,
  loadMultiBookScrapingPageSuccess,
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
import { PAGE_SIZE_DEFAULT } from '@app/core';

describe('MultiBookScraping Reducer', () => {
  const COMICS = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const CURRENT_COMIC = COMICS[Math.floor(Math.random() * COMICS.length)];
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const ISSUE_ID = ISSUE_1.issueNumber;
  const SKIP_CACHE = Math.random() > 0.5;
  const PAGE_NUMBER = 3;
  const PAGE_SIZE = 25;
  const TOTAL_COMICS = 495;

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

    it('has a default page size', () => {
      expect(state.pageSize).toEqual(PAGE_SIZE_DEFAULT);
    });

    it('has the default page number', () => {
      expect(state.pageNumber).toEqual(0);
    });

    it('has the default total comics', () => {
      expect(state.totalComics).toEqual(0);
    });

    it('has no list of comic books', () => {
      expect(state.comics).toEqual([]);
    });

    it('has no current comic book', () => {
      expect(state.currentComicBook).toBeNull();
    });
  });

  describe('starting the multi-book scraping process', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        startMultiBookScraping({ pageSize: PAGE_SIZE })
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
            status: MultiBookScrapingProcessStatus.SETUP,
            pageSize: 0,
            pageNumber: 0,
            totalComics: 0,
            comics: [],
            currentComicBook: null
          },
          startMultiBookScrapingSuccess({
            comics: COMICS,
            pageSize: PAGE_SIZE,
            pageNumber: PAGE_NUMBER,
            totalComics: TOTAL_COMICS
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the status to started', () => {
        expect(state.status).toEqual(MultiBookScrapingProcessStatus.STARTED);
      });

      it('updates the page size', () => {
        expect(state.pageSize).toEqual(PAGE_SIZE);
      });

      it('updates the page number', () => {
        expect(state.pageNumber).toEqual(PAGE_NUMBER);
      });

      it('updates the total comics', () => {
        expect(state.totalComics).toEqual(TOTAL_COMICS);
      });

      it('sets the list of comic details', () => {
        expect(state.comics).toEqual(COMICS);
      });

      it('sets the current  comic detail', () => {
        expect(state.currentComicBook).toEqual(COMICS[0]);
      });

      describe('when there are no comic books', () => {
        beforeEach(() => {
          state = reducer(
            {
              ...state,
              status: MultiBookScrapingProcessStatus.STARTED,
              pageSize: 0,
              pageNumber: 1,
              totalComics: 1
            },
            startMultiBookScrapingSuccess({
              comics: [],
              pageSize: PAGE_SIZE,
              pageNumber: 0,
              totalComics: 0
            })
          );
        });

        it('sets the status to finished', () => {
          expect(state.status).toBe(MultiBookScrapingProcessStatus.FINISHED);
        });

        it('updates the page size', () => {
          expect(state.pageSize).toEqual(PAGE_SIZE);
        });

        it('updates the page number', () => {
          expect(state.pageNumber).toEqual(0);
        });

        it('updates the total comics', () => {
          expect(state.totalComics).toEqual(0);
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

  describe('loading multi-book scraping comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: false },
        loadMultiBookScrapingPage({
          pageSize: PAGE_SIZE,
          pageNumber: PAGE_NUMBER
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
            busy: true,
            pageSize: 0,
            pageNumber: 0,
            totalComics: 0,
            comics: []
          },
          loadMultiBookScrapingPageSuccess({
            pageSize: PAGE_SIZE,
            pageNumber: PAGE_NUMBER,
            totalComics: TOTAL_COMICS,
            comics: COMICS
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the page size', () => {
        expect(state.pageSize).toEqual(PAGE_SIZE);
      });

      it('sets the page number', () => {
        expect(state.pageNumber).toEqual(PAGE_NUMBER);
      });

      it('sets the total number of comics', () => {
        expect(state.totalComics).toEqual(TOTAL_COMICS);
      });

      it('sets the comic books', () => {
        expect(state.comics).toBe(COMICS);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true
          },
          loadMultiBookScrapingPageFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('setting the current comic book', () => {
    const OLD_CURRENT = COMICS[0];
    const NEW_CURRENT = COMICS[1];

    beforeEach(() => {
      state = reducer(
        { ...state, currentComicBook: OLD_CURRENT },
        multiBookScrapingSetCurrentBook({ comic: NEW_CURRENT })
      );
    });

    it('updates the current comic book', () => {
      expect(state.currentComicBook).toBe(NEW_CURRENT);
    });
  });

  describe('removing a book from the process', () => {
    const UPDATED_COMICS = COMICS.filter(
      entry => entry.comicId != CURRENT_COMIC.comicId
    );

    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        multiBookScrapingRemoveBook({
          comic: CURRENT_COMIC,
          pageSize: PAGE_SIZE
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
            pageSize: 0,
            pageNumber: 0,
            totalComics: 0,
            comics: COMICS,
            currentComicBook: null
          },
          multiBookScrapingRemoveBookSuccess({
            comics: UPDATED_COMICS,
            pageSize: PAGE_SIZE,
            pageNumber: PAGE_NUMBER,
            totalComics: TOTAL_COMICS
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('updates the page size', () => {
        expect(state.pageSize).toEqual(PAGE_SIZE);
      });

      it('updates the page number', () => {
        expect(state.pageNumber).toEqual(PAGE_NUMBER);
      });

      it('updates the total comics', () => {
        expect(state.totalComics).toEqual(TOTAL_COMICS);
      });

      it('updates the list of comic details', () => {
        expect(state.comics).toEqual(UPDATED_COMICS);
      });

      it('sets the current  comic detail', () => {
        expect(state.currentComicBook).toEqual(UPDATED_COMICS[0]);
      });

      describe('when it was the last comic book', () => {
        beforeEach(() => {
          state = reducer(
            {
              ...state,
              status: MultiBookScrapingProcessStatus.STARTED,
              pageSize: 0,
              pageNumber: 1,
              totalComics: 1
            },
            multiBookScrapeComicSuccess({
              comics: [],
              pageSize: PAGE_SIZE,
              pageNumber: 0,
              totalComics: 0
            })
          );
        });

        it('sets the status to finished', () => {
          expect(state.status).toBe(MultiBookScrapingProcessStatus.FINISHED);
        });

        it('updates the page size', () => {
          expect(state.pageSize).toEqual(PAGE_SIZE);
        });

        it('updates the page number', () => {
          expect(state.pageNumber).toEqual(0);
        });

        it('updates the total comics', () => {
          expect(state.totalComics).toEqual(0);
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
    const UPDATED_COMICS = COMICS.filter(entry => entry != CURRENT_COMIC);

    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        multiBookScrapeComic({
          metadataSource: METADATA_SOURCE,
          comic: CURRENT_COMIC,
          issueId: ISSUE_ID,
          skipCache: SKIP_CACHE,
          pageSize: PAGE_SIZE,
          pageNumber: PAGE_NUMBER
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
            pageSize: 0,
            pageNumber: 0,
            totalComics: 0,
            comics: COMICS,
            currentComicBook: null
          },
          multiBookScrapeComicSuccess({
            comics: UPDATED_COMICS,
            pageNumber: PAGE_NUMBER,
            pageSize: PAGE_SIZE,
            totalComics: TOTAL_COMICS
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('updates the page size', () => {
        expect(state.pageSize).toEqual(PAGE_SIZE);
      });

      it('updates the page number', () => {
        expect(state.pageNumber).toEqual(PAGE_NUMBER);
      });

      it('updates the total comics', () => {
        expect(state.totalComics).toEqual(TOTAL_COMICS);
      });

      it('updates the list of comic details', () => {
        expect(state.comics).toEqual(UPDATED_COMICS);
      });

      it('sets the current  comic detail', () => {
        expect(state.currentComicBook).toEqual(UPDATED_COMICS[0]);
      });

      describe('when it was the last comic book', () => {
        beforeEach(() => {
          state = reducer(
            {
              ...state,
              status: MultiBookScrapingProcessStatus.STARTED,
              pageSize: 0,
              pageNumber: 1,
              totalComics: 1
            },
            multiBookScrapingRemoveBookSuccess({
              comics: [],
              pageSize: PAGE_SIZE,
              pageNumber: 0,
              totalComics: 0
            })
          );
        });

        it('sets the status to finished', () => {
          expect(state.status).toBe(MultiBookScrapingProcessStatus.FINISHED);
        });

        it('updates the page size', () => {
          expect(state.pageSize).toEqual(PAGE_SIZE);
        });

        it('updates the page number', () => {
          expect(state.pageNumber).toEqual(0);
        });

        it('updates the total comics', () => {
          expect(state.totalComics).toEqual(0);
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

  describe('batch scraping comic books', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, batchScrapeComicBooks());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          batchScrapeComicBooksSuccess()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          batchScrapeComicBooksFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
