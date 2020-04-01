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
  LibraryComicsConverting,
  LibraryConsolidate,
  LibraryConsolidated,
  LibraryConsolidateFailed,
  LibraryConvertComics,
  LibraryConvertComicsFailed,
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryDisplayComics,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryMultipleComicsDeleted,
  LibraryRescanStarted,
  LibraryReset,
  LibraryStartRescan,
  LibraryStartRescanFailed,
  LibraryUpdatesReceived
} from 'app/library/actions/library.actions';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { initialState, LibraryState, reducer } from './library.reducer';

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
  const TITLE = 'The Display Title';

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

    it('has no display comics', () => {
      expect(state.displayComics).toBeNull();
    });

    it('has no display title', () => {
      expect(state.displayTitle).toEqual('');
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

    it('clears the consolidating library flag', () => {
      expect(state.consolidating).toBeFalsy();
    });
  });

  describe('when resetting the library', () => {
    beforeEach(() => {
      state = reducer({ ...state, comics: COMICS }, new LibraryReset());
    });

    it('clears the comics', () => {
      expect(state.comics).toEqual([]);
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

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingUpdates: true,
          comics: CURRENT_COMICS
        },
        new LibraryUpdatesReceived({
          comics: UPDATE_COMICS,
          lastComicId: LAST_COMIC_ID,
          mostRecentUpdate: MOST_RECENT_UPDATE,
          lastReadDates: LAST_READ_DATES,
          moreUpdates: MORE_UPDATES,
          processingCount: PROCESSING_COUNT
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
        new LibraryDeleteMultipleComics({ ids: [1, 2, 3, 4] })
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

  describe('when converting comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, convertingComics: false },
        new LibraryConvertComics({
          comics: COMICS,
          archiveType: 'CBZ',
          renamePages: true
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

  describe('when consolidating the library', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, consolidating: false },
        new LibraryConsolidate({ deletePhysicalFiles: true })
      );
    });

    it('sets the consolidating library flag', () => {
      expect(state.consolidating).toBeTruthy();
    });
  });

  describe('when the library is consolidated', () => {
    const DELETED_COMICS = [COMICS[2]];

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          consolidating: true,
          comics: COMICS
        },
        new LibraryConsolidated({ deletedComics: DELETED_COMICS })
      );
    });

    it('clears the consolidating library flag', () => {
      expect(state.consolidating).toBeFalsy();
    });

    it('removes the deleted comics from the state', () => {
      DELETED_COMICS.forEach(comic =>
        expect(state.comics).not.toContain(comic)
      );
    });
  });

  describe('when consolidation fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, consolidating: true },
        new LibraryConsolidateFailed()
      );
    });

    it('clears the consolidating library flag', () => {
      expect(state.consolidating).toBeFalsy();
    });
  });

  describe('setting the comics to display', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, displayComics: null },
        new LibraryDisplayComics({ title: TITLE, comics: COMICS })
      );
    });

    it('updates the set of display comics', () => {
      expect(state.displayComics).toEqual(COMICS);
    });

    it('updates the display title', () => {
      expect(state.displayTitle).toEqual(TITLE);
    });
  });
});
