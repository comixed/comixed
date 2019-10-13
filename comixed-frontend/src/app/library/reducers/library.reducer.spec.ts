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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { initial_state, reducer } from './library.reducer';
import { LibraryState } from 'app/library/models/library-state';
import {
  LibraryBlockPageHash,
  LibraryBlockPageHashFailed,
  LibraryClearMetadata,
  LibraryClearMetadataFailed,
  LibraryComicUpdated,
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryFindCurrentComic,
  LibraryGetFormats,
  LibraryGetFormatsFailed,
  LibraryGetScanTypes,
  LibraryGetScanTypesFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryFormatsReceived,
  LibraryGotScanTypes,
  LibraryUpdatesReceived,
  LibraryMetadataCleared,
  LibraryMultipleComicsDeleted,
  LibraryPageHashBlocked,
  LibraryRescanStarted,
  LibraryReset,
  LibrarySetCurrentComic,
  LibraryStartRescan,
  LibraryStartRescanFailed,
  LibraryUpdateComic,
  LibraryUpdateComicFailed
} from 'app/library/actions/library.actions';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5,
  SCAN_TYPE_7
} from 'app/comics/models/scan-type.fixtures';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/models/comic.fixtures';
import { generate_random_string } from '../../../test/testing-utils';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';

describe('Library Reducer', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5, SCAN_TYPE_7];
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];
  const COMIC = { ...COMIC_1 };
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const HASH = generate_random_string();
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];

  let state: LibraryState;

  beforeEach(() => {
    state = { ...initial_state };
  });

  describe('an unknown action', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching scan types flag', () => {
      expect(state.fetchingScanTypes).toBeFalsy();
    });

    it('has an empty array of scan types', () => {
      expect(state.scanTypes).toEqual([]);
    });

    it('clears the fetching formats flag', () => {
      expect(state.fetchingFormats).toBeFalsy();
    });

    it('has an empty array of formats', () => {
      expect(state.formats).toEqual([]);
    });

    it('clears the fetching updates flag', () => {
      expect(state.fetchingUpdates).toBeFalsy();
    });

    it('has an empty array of comics', () => {
      expect(state.comics).toEqual([]);
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

    it('clears the updating comic flag', () => {
      expect(state.updatingComic).toBeFalsy();
    });

    it('has no current comic', () => {
      expect(state.currentComic).toBeNull();
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearingMetadata).toBeFalsy();
    });

    it('clears the blocking hash flag', () => {
      expect(state.blockingHash).toBeFalsy();
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

  describe('when fetching the scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingScanTypes: false },
        new LibraryGetScanTypes()
      );
    });

    it('sets the fetching scan types flag', () => {
      expect(state.fetchingScanTypes).toBeTruthy();
    });
  });

  describe('when the scan types are received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingScanTypes: true, scanTypes: [] },
        new LibraryGotScanTypes({ scanTypes: SCAN_TYPES })
      );
    });

    it('clears the fetching scan types flag', () => {
      expect(state.fetchingScanTypes).toBeFalsy();
    });

    it('sets the scan types', () => {
      expect(state.scanTypes).toEqual(SCAN_TYPES);
    });
  });

  describe('when it fails to get the scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingScanTypes: true },
        new LibraryGetScanTypesFailed()
      );
    });

    it('clears the fetching scan types flag', () => {
      expect(state.fetchingScanTypes).toBeFalsy();
    });
  });

  describe('getting the set of formats', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingFormats: false },
        new LibraryGetFormats()
      );
    });

    it('sets the fetching formats flag', () => {
      expect(state.fetchingFormats).toBeTruthy();
    });
  });

  describe('when the formats are received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingFormats: true, formats: [] },
        new LibraryFormatsReceived({ formats: FORMATS })
      );
    });

    it('clears the fetching formats flag', () => {
      expect(state.fetchingFormats).toBeFalsy();
    });

    it('sets the formats', () => {
      expect(state.formats).toEqual(FORMATS);
    });
  });

  describe('when it fails to get the formats', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingFormats: true },
        new LibraryGetFormatsFailed()
      );
    });

    it('clears the fetching formats flag', () => {
      expect(state.fetchingFormats).toBeFalsy();
    });
  });

  describe('when getting library updates', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingUpdates: false },
        new LibraryGetUpdates({
          timestamp: new Date().getTime(),
          timeout: 60,
          maximumResults: 100
        })
      );
    });

    it('sets the fetching updates flag', () => {
      expect(state.fetchingUpdates).toBeTruthy();
    });
  });

  describe('when updates are received', () => {
    const LATEST_UPDATE = new Date().getTime();
    const CURRENT_COMIC = COMIC_2;
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
          comics: CURRENT_COMICS,
          currentComic: CURRENT_COMIC
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

    it('updates the last read dates', () => {
      expect(state.lastReadDates).toEqual(LAST_READ_DATES);
    });

    it('updates the latest comic update', () => {
      expect(state.latestUpdatedDate).toEqual(LATEST_UPDATE);
    });

    it('updates the pending imports count', () => {
      expect(state.processingCount).toEqual(PENDING_IMPORTS);
    });

    it('updates the current comic if it was received', () => {
      expect(state.currentComic).toEqual(UPDATED_COMIC);
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

  describe('when updating a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updatingComic: false },
        new LibraryUpdateComic({ comic: COMIC })
      );
    });

    it('sets the updating comic flag', () => {
      expect(state.updatingComic).toBeTruthy();
    });
  });

  describe('when a comic is updated', () => {
    const UPDATED_COMIC = { ...COMIC, series: generate_random_string() };

    beforeEach(() => {
      state = reducer(
        { ...state, updatingComic: true, currentComic: COMIC },
        new LibraryComicUpdated({ comic: UPDATED_COMIC })
      );
    });

    it('clears the updating comic flag', () => {
      expect(state.updatingComic).toBeFalsy();
    });

    it('sets the current comic', () => {
      expect(state.currentComic).toEqual(UPDATED_COMIC);
    });
  });

  describe('when updating a comic fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updatingComic: true },
        new LibraryUpdateComicFailed()
      );
    });

    it('clears the updating comic flag', () => {
      expect(state.updatingComic).toBeFalsy();
    });
  });

  describe('when clearing metadata', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingMetadata: false },
        new LibraryClearMetadata({ comic: COMIC })
      );
    });

    it('sets the clearing metadata flag', () => {
      expect(state.clearingMetadata).toBeTruthy();
    });
  });

  describe('when metadata is cleared', () => {
    const UPDATED_COMIC = { ...COMIC, series: generate_random_string() };

    beforeEach(() => {
      state = reducer(
        { ...state, clearingMetadata: true, currentComic: COMIC },
        new LibraryMetadataCleared({ comic: UPDATED_COMIC })
      );
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearingMetadata).toBeFalsy();
    });

    it('updates the current comic', () => {
      expect(state.currentComic).toEqual(UPDATED_COMIC);
    });
  });

  describe('when clearing metadata fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearingMetadata: true },
        new LibraryClearMetadataFailed()
      );
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearingMetadata).toBeFalsy();
    });
  });

  describe('when blocking a page hash', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blockingHash: false },
        new LibraryBlockPageHash({ hash: HASH, blocked: true })
      );
    });

    it('sets the blocking hash flag', () => {
      expect(state.blockingHash).toBeTruthy();
    });
  });

  describe('when a page has is blocked', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blockingHash: true },
        new LibraryPageHashBlocked({ hash: HASH, blocked: true })
      );
    });

    it('clears the blocking hash flag', () => {
      expect(state.blockingHash).toBeFalsy();
    });
  });

  describe('when blocking a page hash fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blockingHash: true },
        new LibraryBlockPageHashFailed()
      );
    });

    it('clears the blocking hash flag', () => {
      expect(state.blockingHash).toBeFalsy();
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

  describe('when setting the current comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, currentComic: null },
        new LibrarySetCurrentComic({ comic: COMIC })
      );
    });

    it('updates the state', () => {
      expect(state.currentComic).toEqual(COMIC);
    });
  });

  describe('when finding the current comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, currentComic: null, comics: COMICS },
        new LibraryFindCurrentComic({ id: COMICS[0].id })
      );
    });

    it('sets the current comic', () => {
      expect(state.currentComic).toEqual(COMICS[0]);
    });
  });
});
