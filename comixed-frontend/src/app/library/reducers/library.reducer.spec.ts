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
import * as LibraryActions from 'app/library/actions/library.actions';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5,
  SCAN_TYPE_7
} from 'app/comics/models/scan-type.fixtures';
import {
  LibraryActionTypes,
  LibraryGetFormats
} from 'app/library/actions/library.actions';
import { LibraryGotFormats } from 'app/library/actions/library.actions';
import { LibraryGetFormatsFailed } from 'app/library/actions/library.actions';
import { LibraryGetUpdates } from 'app/library/actions/library.actions';
import { LibraryGotUpdates } from 'app/library/actions/library.actions';
import { LibraryGetUpdatesFailed } from 'app/library/actions/library.actions';
import { LibraryStartRescan } from 'app/library/actions/library.actions';
import { LibraryRescanStarted } from 'app/library/actions/library.actions';
import { LibraryStartRescanFailed } from 'app/library/actions/library.actions';
import { LibraryUpdateComic } from 'app/library/actions/library.actions';
import { LibraryComicUpdated } from 'app/library/actions/library.actions';
import { LibraryUpdateComicFailed } from 'app/library/actions/library.actions';
import { LibraryClearMetadata } from 'app/library/actions/library.actions';
import { LibraryMetadataCleared } from 'app/library/actions/library.actions';
import { LibraryClearMetadataFailed } from 'app/library/actions/library.actions';
import { LibraryBlockPageHash } from 'app/library/actions/library.actions';
import { LibraryPageHashBlocked } from 'app/library/actions/library.actions';
import { LibraryBlockPageHashFailed } from 'app/library/actions/library.actions';
import { LibraryDeleteMultipleComics } from 'app/library/actions/library.actions';
import { LibraryMultipleComicsDeleted } from 'app/library/actions/library.actions';
import { LibraryDeleteMultipleComicsFailed } from 'app/library/actions/library.actions';
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
      expect(state.fetching_scan_types).toBeFalsy();
    });

    it('has an empty array of scan types', () => {
      expect(state.scan_types).toEqual([]);
    });

    it('clears the fetching formats flag', () => {
      expect(state.fetching_formats).toBeFalsy();
    });

    it('has an empty array of formats', () => {
      expect(state.formats).toEqual([]);
    });

    it('clears the fetching updates flag', () => {
      expect(state.fetching_updates).toBeFalsy();
    });

    it('has an empty array of comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('has an empty array of last read dates', () => {
      expect(state.last_read_dates).toEqual([]);
    });

    it('has a latest updated date of 0', () => {
      expect(state.latest_updated_date).toEqual(0);
    });

    it('clears the starting rescan flag', () => {
      expect(state.starting_rescan).toBeFalsy();
    });

    it('clears the updating comic flag', () => {
      expect(state.updating_comic).toBeFalsy();
    });

    it('has no current comic', () => {
      expect(state.current_comic).toBeNull();
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearing_metadata).toBeFalsy();
    });

    it('clears the blocking hash flag', () => {
      expect(state.blocking_hash).toBeFalsy();
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deleting_multiple_comics).toBeFalsy();
    });
  });

  describe('when resetting the library', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, comics: COMICS },
        new LibraryActions.LibraryResetLibrary()
      );
    });

    it('clears the comics', () => {
      expect(state.comics).toEqual([]);
    });
  });

  describe('when fetching the scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_scan_types: false },
        new LibraryActions.LibraryGetScanTypes()
      );
    });

    it('sets the fetching scan types flag', () => {
      expect(state.fetching_scan_types).toBeTruthy();
    });
  });

  describe('when the scan types are received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_scan_types: true, scan_types: [] },
        new LibraryActions.LibraryGotScanTypes({ scan_types: SCAN_TYPES })
      );
    });

    it('clears the fetching scan types flag', () => {
      expect(state.fetching_scan_types).toBeFalsy();
    });

    it('sets the scan types', () => {
      expect(state.scan_types).toEqual(SCAN_TYPES);
    });
  });

  describe('when it fails to get the scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_scan_types: true },
        new LibraryActions.LibraryGetScanTypesFailed()
      );
    });

    it('clears the fetching scan types flag', () => {
      expect(state.fetching_scan_types).toBeFalsy();
    });
  });

  describe('getting the set of formats', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_formats: false },
        new LibraryActions.LibraryGetFormats()
      );
    });

    it('sets the fetching formats flag', () => {
      expect(state.fetching_formats).toBeTruthy();
    });
  });

  describe('when the formats are received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_formats: true, formats: [] },
        new LibraryActions.LibraryGotFormats({ formats: FORMATS })
      );
    });

    it('clears the fetching formats flag', () => {
      expect(state.fetching_formats).toBeFalsy();
    });

    it('sets the formats', () => {
      expect(state.formats).toEqual(FORMATS);
    });
  });

  describe('when it fails to get the formats', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_formats: true },
        new LibraryActions.LibraryGetFormatsFailed()
      );
    });

    it('clears the fetching formats flag', () => {
      expect(state.fetching_formats).toBeFalsy();
    });
  });

  describe('when getting library updates', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_updates: false },
        new LibraryActions.LibraryGetUpdates({
          later_than: new Date().getTime(),
          timeout: 60,
          maximum: 100
        })
      );
    });

    it('sets the fetching updates flag', () => {
      expect(state.fetching_updates).toBeTruthy();
    });
  });

  describe('when updates are received', () => {
    const LATEST_UPDATE = new Date().getTime();
    const CURRENT_COMICS = [
      { ...COMIC_1, lastUpdatedDate: 0 },
      { ...COMIC_3, lastUpdatedDate: 0 },
      { ...COMIC_5, lastUpdatedDate: 0 }
    ];
    const UPDATE_COMICS = [
      { ...COMIC_2, lastUpdatedDate: LATEST_UPDATE },
      { ...COMIC_4, lastUpdatedDate: 0 }
    ];
    const PENDING_IMPORTS = 20;
    const PENDING_RESCANS = 21;

    beforeEach(() => {
      state = reducer(
        { ...state, fetching_updates: true, comics: CURRENT_COMICS },
        new LibraryActions.LibraryGotUpdates({
          comics: UPDATE_COMICS,
          last_read_dates: LAST_READ_DATES,
          pending_imports: PENDING_IMPORTS,
          pending_rescans: PENDING_RESCANS
        })
      );
    });

    it('clears the fetching updates flag', () => {
      expect(state.fetching_updates).toBeFalsy();
    });

    it('updates the set of comics', () => {
      expect(state.comics).toEqual(CURRENT_COMICS.concat(UPDATE_COMICS));
    });

    it('updates the latest comic update', () => {
      expect(state.latest_updated_date).toEqual(LATEST_UPDATE);
    });

    it('updates the pending imports count', () => {
      expect(state.pending_imports).toEqual(PENDING_IMPORTS);
    });
  });

  describe('when getting updates fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching_updates: true },
        new LibraryActions.LibraryGetUpdatesFailed()
      );
    });

    it('clears the fetching updates flag', () => {
      expect(state.fetching_updates).toBeFalsy();
    });
  });

  describe('when starting a rescan', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting_rescan: false },
        new LibraryActions.LibraryStartRescan()
      );
    });

    it('sets the starting rescan flag', () => {
      expect(state.starting_rescan).toBeTruthy();
    });
  });

  describe('when rescanning has started', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting_rescan: true },
        new LibraryActions.LibraryRescanStarted({ count: 17 })
      );
    });

    it('clears the starting rescan flag', () => {
      expect(state.starting_rescan).toBeFalsy();
    });
  });

  describe('when starting the rescan fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting_rescan: true },
        new LibraryActions.LibraryStartRescanFailed()
      );
    });

    it('clears the starting rescan flag', () => {
      expect(state.starting_rescan).toBeFalsy();
    });
  });

  describe('when updating a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating_comic: false },
        new LibraryActions.LibraryUpdateComic({ comic: COMIC })
      );
    });

    it('sets the updating comic flag', () => {
      expect(state.updating_comic).toBeTruthy();
    });
  });

  describe('when a comic is updated', () => {
    const UPDATED_COMIC = { ...COMIC, series: generate_random_string() };

    beforeEach(() => {
      state = reducer(
        { ...state, updating_comic: true, current_comic: COMIC },
        new LibraryActions.LibraryComicUpdated({ comic: UPDATED_COMIC })
      );
    });

    it('clears the updating comic flag', () => {
      expect(state.updating_comic).toBeFalsy();
    });

    it('sets the current comic', () => {
      expect(state.current_comic).toEqual(UPDATED_COMIC);
    });
  });

  describe('when updating a comic fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, updating_comic: true },
        new LibraryActions.LibraryUpdateComicFailed()
      );
    });

    it('clears the updating comic flag', () => {
      expect(state.updating_comic).toBeFalsy();
    });
  });

  describe('when clearing metadata', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearing_metadata: false },
        new LibraryActions.LibraryClearMetadata({ comic: COMIC })
      );
    });

    it('sets the clearing metadata flag', () => {
      expect(state.clearing_metadata).toBeTruthy();
    });
  });

  describe('when metadata is cleared', () => {
    const UPDATED_COMIC = { ...COMIC, series: generate_random_string() };

    beforeEach(() => {
      state = reducer(
        { ...state, clearing_metadata: true, current_comic: COMIC },
        new LibraryActions.LibraryMetadataCleared({ comic: UPDATED_COMIC })
      );
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearing_metadata).toBeFalsy();
    });

    it('updates the current comic', () => {
      expect(state.current_comic).toEqual(UPDATED_COMIC);
    });
  });

  describe('when clearing metadata fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, clearing_metadata: true },
        new LibraryActions.LibraryClearMetadataFailed()
      );
    });

    it('clears the clearing metadata flag', () => {
      expect(state.clearing_metadata).toBeFalsy();
    });
  });

  describe('when blocking a page hash', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blocking_hash: false },
        new LibraryActions.LibraryBlockPageHash({ hash: HASH, blocked: true })
      );
    });

    it('sets the blocking hash flag', () => {
      expect(state.blocking_hash).toBeTruthy();
    });
  });

  describe('when a page has is blocked', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blocking_hash: true },
        new LibraryActions.LibraryPageHashBlocked({ hash: HASH, blocked: true })
      );
    });

    it('clears the blocking hash flag', () => {
      expect(state.blocking_hash).toBeFalsy();
    });
  });

  describe('when blocking a page hash fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, blocking_hash: true },
        new LibraryActions.LibraryBlockPageHashFailed()
      );
    });

    it('clears the blocking hash flag', () => {
      expect(state.blocking_hash).toBeFalsy();
    });
  });

  describe('when deleting multiple comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deleting_multiple_comics: false },
        new LibraryActions.LibraryDeleteMultipleComics({ ids: [1, 2, 3, 4] })
      );
    });

    it('sets the deleting multiple comics flag', () => {
      expect(state.deleting_multiple_comics).toBeTruthy();
    });
  });

  describe('when multiple comics are deleted', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deleting_multiple_comics: true },
        new LibraryActions.LibraryMultipleComicsDeleted({ count: 5 })
      );
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deleting_multiple_comics).toBeFalsy();
    });
  });

  describe('when deleting multiple comics fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deleting_multiple_comics: true },
        new LibraryActions.LibraryDeleteMultipleComicsFailed()
      );
    });

    it('clears the deleting multiple comics flag', () => {
      expect(state.deleting_multiple_comics).toBeFalsy();
    });
  });

  describe('when setting the current comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current_comic: null },
        new LibraryActions.LibrarySetCurrentComic({ comic: COMIC })
      );
    });

    it('updates the state', () => {
      expect(state.current_comic).toEqual(COMIC);
    });
  });

  describe('when finding the current comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current_comic: null, comics: COMICS },
        new LibraryActions.LibraryFindCurrentComic({ id: COMICS[0].id })
      );
    });

    it('sets the current comic', () => {
      expect(state.current_comic).toEqual(COMICS[0]);
    });
  });
});
