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

import { initial_state, LibraryState, reducer } from './library.reducer';
import {
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryMultipleComicsDeleted,
  LibraryRescanStarted,
  LibraryReset,
  LibraryStartRescan,
  LibraryStartRescanFailed,
  LibraryUpdatesReceived
} from 'app/library/actions/library.actions';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/models/comic.fixtures';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';

describe('Library Reducer', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];

  let state: LibraryState;

  beforeEach(() => {
    state = { ...initial_state };
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

    it('has an empty array of updated ids', () => {
      expect(state.updatedIds).toEqual([]);
    });

    it('has an empty array of last read dates', () => {
      expect(state.lastReadDates).toEqual([]);
    });

    it('has a latest updated date of 0', () => {
      expect(state.latestUpdatedDate).toEqual(0);
    });

    it('clears the starting rescan flag', () => {
      expect(state.startingRescan).toBeFalsy();
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deletingComics).toBeFalsy();
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
          timestamp: new Date().getTime(),
          timeout: 60,
          maximumResults: 100,
          lastProcessingCount: 27,
          lastRescanCount: 32
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
    const PENDING_IMPORTS = 20;
    const PENDING_RESCANS = 21;

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingUpdates: true,
          comics: CURRENT_COMICS
        },
        new LibraryUpdatesReceived({
          comics: UPDATE_COMICS,
          lastReadDates: LAST_READ_DATES,
          processingCount: PENDING_IMPORTS,
          rescanCount: PENDING_RESCANS
        })
      );
    });

    it('clears the fetching updates flag', () => {
      expect(state.fetchingUpdates).toBeFalsy();
    });

    it('updates the set of comics', () => {
      expect(state.comics).toEqual(CURRENT_COMICS.concat(UPDATE_COMICS));
    });

    it('contains the list of updated ids', () => {
      expect(state.updatedIds.sort()).toEqual(
        UPDATE_COMICS.map(comic => comic.id).sort()
      );
    });

    it('updates the last read dates', () => {
      expect(state.lastReadDates).toEqual(LAST_READ_DATES);
    });

    it('updates the latest comic update', () => {
      expect(state.latestUpdatedDate).toEqual(LATEST_UPDATE);
    });

    it('updates the pending imports count', () => {
      expect(state.processingCount).toEqual(PENDING_IMPORTS);
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
});
