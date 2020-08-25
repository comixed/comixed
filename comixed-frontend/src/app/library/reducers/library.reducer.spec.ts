/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/models/comic.fixtures';
import {
  LibraryClearImageCache,
  LibraryClearImageCacheFailed,
  LibraryComicsConverting,
  LibraryConvertComics,
  LibraryConvertComicsFailed,
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryImageCacheCleared,
  LibraryMultipleComicsDeleted,
  LibraryMultipleComicsUndeleted,
  LibraryRescanStarted,
  LibraryReset,
  LibraryStartRescan,
  LibraryStartRescanFailed,
  LibraryUndeleteMultipleComics,
  LibraryUndeleteMultipleComicsFailed,
  LibraryUpdatesReceived
} from 'app/library/actions/library.actions';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { initialState, LibraryState, reducer } from './library.reducer';
import {
  READING_LIST_1,
  READING_LIST_2
} from 'app/comics/models/reading-list.fixtures';

describe('Library Reducer', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_COMIC_ID = 2814;
  const MOST_RECENT_UPDATE = new Date();
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const MORE_UPDATES = true;
  const PAGE = 1;
  const COUNT = 25;
  const SORT_FIELD = 'addedDate';
  const ASCENDING = true;
  const COMIC_COUNT = 2372;
  const LATEST_UPDATED_DATE = new Date();
  const COMIC_IDS = [1, 2, 3, 4];

  let state: LibraryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching updates flag', () => {
      expect(state.fetchingUpdates).toBeFalsy();
    });

    it('has an empty array of comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('has a zero last comic id', () => {
      expect(state.lastComicId).toEqual(0);
    });

    it('has an empty array of updated ids', () => {
      expect(state.updatedIds).toEqual([]);
    });

    it('has an empty array of last read dates', () => {
      expect(state.lastReadDates).toEqual([]);
    });

    it('has a comic count of 0', () => {
      expect(state.comicCount).toEqual(0);
    });

    it('clears the more updates flag', () => {
      expect(state.moreUpdates).toBeFalsy();
    });

    it('has a no latest updated date', () => {
      expect(state.latestUpdatedDate).toEqual(new Date(0));
    });

    it('clears the starting rescan flag', () => {
      expect(state.startingRescan).toBeFalsy();
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deletingComics).toBeFalsy();
    });

    it('clears the converting comics flag', () => {
      expect(state.convertingComics).toBeFalsy();
    });

    it('has no reading lists', () => {
      expect(state.readingLists).toEqual([]);
    });

    it('clears the clearing image cache flag', () => {
      expect(state.clearingImageCache).toBeFalsy();
    });
  });

  describe('when resetting the library', () => {
    beforeEach(() => {
      state = reducer({ ...state, comics: COMICS }, new LibraryReset());
    });

    it('clears the comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('has no reading lists', () => {
      expect(state.readingLists).toEqual([]);
    });
  });

  describe('when getting library updates', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingUpdates: false },
        new LibraryGetUpdates({
          lastUpdateDate: new Date(),
          timeout: 60,
          maximumComics: 100,
          processingCount: 27,
          lastComicId: 1010
        })
      );
    });

    it('sets the fetching updates flag', () => {
      expect(state.fetchingUpdates).toBeTruthy();
    });
  });

  describe('when updates are received', () => {
    const LATEST_UPDATE = new Date().getTime();
    const UPDATED_COMIC = { ...COMIC_2, lastUpdatedDate: LATEST_UPDATE };
    const CURRENT_COMICS = [
      { ...COMIC_1, lastUpdatedDate: 0 },
      { ...COMIC_3, lastUpdatedDate: 0 },
      { ...COMIC_5, lastUpdatedDate: 0 }
    ];
    const UPDATE_COMICS = [UPDATED_COMIC, { ...COMIC_4, lastUpdatedDate: 0 }];
    const PROCESSING_COUNT = 20;
    const READING_LISTS = [READING_LIST_2];

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingUpdates: true,
          comics: CURRENT_COMICS,
          readingLists: [READING_LIST_1]
        },
        new LibraryUpdatesReceived({
          comics: UPDATE_COMICS,
          lastComicId: LAST_COMIC_ID,
          mostRecentUpdate: MOST_RECENT_UPDATE,
          lastReadDates: LAST_READ_DATES,
          moreUpdates: MORE_UPDATES,
          processingCount: PROCESSING_COUNT,
          readingLists: READING_LISTS
        })
      );
    });

    it('clears the fetching updates flag', () => {
      expect(state.fetchingUpdates).toBeFalsy();
    });

    it('updates the set of comics', () => {
      expect(state.comics).toEqual(CURRENT_COMICS.concat(UPDATE_COMICS));
    });

    it('updates the last comic id', () => {
      expect(state.lastComicId).toEqual(LAST_COMIC_ID);
    });

    it('updates the last read dates', () => {
      expect(state.lastReadDates).toEqual(LAST_READ_DATES);
    });

    it('updates the latest comic update', () => {
      expect(state.latestUpdatedDate).toEqual(MOST_RECENT_UPDATE);
    });

    it('updates the pending imports count', () => {
      expect(state.processingCount).toEqual(PROCESSING_COUNT);
    });

    it('sets the more updates flag', () => {
      expect(state.moreUpdates).toEqual(MORE_UPDATES);
    });

    it('updates the reading lists', () => {
      expect(state.readingLists).toEqual([READING_LIST_1, READING_LIST_2]);
    });
  });

  describe('when getting updates fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingUpdates: true },
        new LibraryGetUpdatesFailed()
      );
    });

    it('clears the fetching updates flag', () => {
      expect(state.fetchingUpdates).toBeFalsy();
    });
  });

  describe('when starting a rescan', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingRescan: false },
        new LibraryStartRescan()
      );
    });

    it('sets the starting rescan flag', () => {
      expect(state.startingRescan).toBeTruthy();
    });
  });

  describe('when rescanning has started', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingRescan: true },
        new LibraryRescanStarted({ count: 17 })
      );
    });

    it('clears the starting rescan flag', () => {
      expect(state.startingRescan).toBeFalsy();
    });
  });

  describe('when starting the rescan fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingRescan: true },
        new LibraryStartRescanFailed()
      );
    });

    it('clears the starting rescan flag', () => {
      expect(state.startingRescan).toBeFalsy();
    });
  });

  describe('when deleting multiple comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingComics: false },
        new LibraryDeleteMultipleComics({ ids: COMIC_IDS })
      );
    });

    it('sets the deleting multiple comics flag', () => {
      expect(state.deletingComics).toBeTruthy();
    });
  });

  describe('when multiple comics are deleted', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingComics: true },
        new LibraryMultipleComicsDeleted({ count: 5 })
      );
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deletingComics).toBeFalsy();
    });
  });

  describe('when deleting multiple comics fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingComics: true },
        new LibraryDeleteMultipleComicsFailed()
      );
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deletingComics).toBeFalsy();
    });
  });

  describe('when undeleting multiple comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingComics: false },
        new LibraryUndeleteMultipleComics({ ids: COMIC_IDS })
      );
    });

    it('sets the deleting comics flag', () => {
      expect(state.deletingComics).toBeTruthy();
    });
  });

  describe('when multiple comics are undeleted', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingComics: true },
        new LibraryMultipleComicsUndeleted()
      );
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deletingComics).toBeFalsy();
    });
  });

  describe('when undeleting multiple comics fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deletingComics: true },
        new LibraryUndeleteMultipleComicsFailed()
      );
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deletingComics).toBeFalsy();
    });
  });

  describe('when converting comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, convertingComics: false },
        new LibraryConvertComics({
          comics: COMICS,
          archiveType: 'CBZ',
          renamePages: true,
          deletePages: true,
          deleteOriginal: true
        })
      );
    });

    it('sets the converting comics flag', () => {
      expect(state.convertingComics).toBeTruthy();
    });
  });

  describe('when comics have started converting', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, convertingComics: true },
        new LibraryComicsConverting()
      );
    });

    it('clears the converting comics flag', () => {
      expect(state.convertingComics).toBeFalsy();
    });
  });

  describe('when comics fail to start converting', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, convertingComics: true },
        new LibraryConvertComicsFailed()
      );
    });

    it('clears the converting comics flag', () => {
      expect(state.convertingComics).toBeFalsy();
    });
  });

  describe('clearing the image cache', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingImageCache: false },
        new LibraryClearImageCache()
      );
    });

    it('sets the clearing image cache flag', () => {
      expect(state.clearingImageCache).toBeTruthy();
    });
  });

  describe('when the image cache is cleared', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingImageCache: true },
        new LibraryImageCacheCleared()
      );
    });

    it('clears the clearing image cache flag', () => {
      expect(state.clearingImageCache).toBeFalsy();
    });
  });

  describe('when the image cache fails to clear', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingImageCache: true },
        new LibraryClearImageCacheFailed()
      );
    });

    it('clears the clearing image cache flag', () => {
      expect(state.clearingImageCache).toBeFalsy();
    });
  });
});
