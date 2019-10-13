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

import { LibraryAdaptor } from './library.adaptor';
import { TestBed } from '@angular/core/testing';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5
} from 'app/comics/models/scan-type.fixtures';
import { Store, StoreModule } from '@ngrx/store';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import * as LibraryActions from '../actions/library.actions';
import {
  AppState,
  Comic,
  COMIC_2,
  COMIC_4,
  ComicCollectionEntry
} from 'app/library';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/models/comic.fixtures';
import { generate_random_string } from '../../../test/testing-utils';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import {
  LibraryFindCurrentComic,
  LibraryGetFormats,
  LibraryGetScanTypes,
  LibraryGetUpdates,
  LibraryFormatsReceived,
  LibraryGotScanTypes,
  LibraryUpdatesReceived,
  LibrarySetCurrentComic
} from '../actions/library.actions';
import {
  COMIC_COLLECTION_ENTRY_1,
  COMIC_COLLECTION_ENTRY_2
} from 'app/library/models/comic-collection-entry.fixtures';

describe('LibraryAdaptor', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5];
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const COMIC = COMIC_1;
  const HASH = generate_random_string();
  const IDS = [7, 17, 65, 1, 29, 71];

  let adaptor: LibraryAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ library_state: reducer })],
      providers: [LibraryAdaptor]
    });

    adaptor = TestBed.get(LibraryAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('getting the set of scan types', () => {
    beforeEach(() => {
      adaptor.getScanTypes();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new LibraryGetScanTypes());
    });

    it('provides notification', () => {
      adaptor.fetchingScanType$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('when received', () => {
      beforeEach(() => {
        store.dispatch(new LibraryGotScanTypes({ scanTypes: SCAN_TYPES }));
      });

      it('returns the set when loaded', () => {
        adaptor.scanType$.subscribe(response =>
          expect(response).toEqual(SCAN_TYPES)
        );
      });

      it('provides notification', () => {
        adaptor.fetchingScanType$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('getting the set of comic formats', () => {
    beforeEach(() => {
      adaptor.getFormats();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new LibraryGetFormats());
    });

    it('provides notification', () => {
      adaptor.fetchingFormat$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('when received', () => {
      beforeEach(() => {
        store.dispatch(new LibraryFormatsReceived({ formats: FORMATS }));
      });

      it('returns the set when loaded', () => {
        adaptor.format$.subscribe(response =>
          expect(response).toEqual(FORMATS)
        );
      });

      it('provides notification', () => {
        adaptor.fetchingFormat$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('getting library updates', () => {
    let lastUpdate: number;

    beforeEach(() => {
      adaptor.latestUpdatedDate$.subscribe(date => (lastUpdate = date));
      adaptor.getLibraryUpdates();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryGetUpdates({
          timestamp: lastUpdate,
          timeout: 60,
          maximumResults: 100
        })
      );
    });

    it('provides notification', () => {
      adaptor.fetchingUpdate$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('and updates are received', () => {
      const PENDING_RESCANS = 17;
      const PENDING_IMPORTS = 29;

      beforeEach(() => {
        store.dispatch(
          new LibraryUpdatesReceived({
            comics: COMICS,
            rescanCount: PENDING_RESCANS,
            lastReadDates: LAST_READ_DATES,
            processingCount: PENDING_IMPORTS
          })
        );
      });

      it('provides notification', () => {
        adaptor.fetchingUpdate$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the comic set', () => {
        adaptor.comic$.subscribe(response => expect(response).toEqual(COMICS));
      });

      it('updates the last read dates set', () => {
        adaptor.lastReadDate$.subscribe(response =>
          expect(response).toEqual(LAST_READ_DATES)
        );
      });

      it('updates the pending rescans count', () => {
        adaptor.rescanCount$.subscribe(response =>
          expect(response).toEqual(PENDING_RESCANS)
        );
      });

      it('updates the pending imports count', () => {
        adaptor.processingCount$.subscribe(response =>
          expect(response).toEqual(PENDING_IMPORTS)
        );
      });
    });
  });

  it('fires an action on reset', () => {
    adaptor.resetLibrary();
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryReset()
    );
  });

  it('provides updates on publishers', () => {
    const values = [COMIC_COLLECTION_ENTRY_1, COMIC_COLLECTION_ENTRY_2];
    adaptor._publisher$.next(values);
    adaptor.publisher$.subscribe(result => expect(result).toEqual(values));
  });

  it('provides updates on series', () => {
    const values = [COMIC_COLLECTION_ENTRY_1, COMIC_COLLECTION_ENTRY_2];
    adaptor._serie$.next(values);
    adaptor.serie$.subscribe(result => expect(result).toEqual(values));
  });

  it('provides updates on characters', () => {
    const values = [COMIC_COLLECTION_ENTRY_1, COMIC_COLLECTION_ENTRY_2];
    adaptor._character$.next(values);
    adaptor.character$.subscribe(result => expect(result).toEqual(values));
  });

  it('provides updates on teams', () => {
    const values = [COMIC_COLLECTION_ENTRY_1, COMIC_COLLECTION_ENTRY_2];
    adaptor._team$.next(values);
    adaptor.team$.subscribe(result => expect(result).toEqual(values));
  });

  it('provides updates on locations', () => {
    const values = [COMIC_COLLECTION_ENTRY_1, COMIC_COLLECTION_ENTRY_2];
    adaptor._location$.next(values);
    adaptor.location$.subscribe(result => expect(result).toEqual(values));
  });

  it('provides updates on story arcs', () => {
    const values = [COMIC_COLLECTION_ENTRY_1, COMIC_COLLECTION_ENTRY_2];
    adaptor._stories$.next(values);
    adaptor.stories$.subscribe(result => expect(result).toEqual(values));
  });

  it('provides a way to update the current comic', () => {
    adaptor._currentComic$.next(COMIC);
    adaptor.currentComic$.subscribe(response =>
      expect(response).toEqual(COMIC)
    );
  });

  describe('getting the current comic', () => {
    beforeEach(() => {
      store.dispatch(new LibrarySetCurrentComic({ comic: COMIC }));
    });

    it('updates the current comic id', () => {
      adaptor.currentComicId$.subscribe(response =>
        expect(response).toEqual(COMIC.id)
      );
    });

    it('updates the current comic', () => {
      adaptor.currentComic$.subscribe(response =>
        expect(response).toEqual(COMIC)
      );
    });

    describe('when the current comic is updated', () => {
      const UPDATED_COMIC: Comic = {
        ...COMIC,
        sortName: 'this is the updated sort name'
      };

      beforeEach(() => {
        store.dispatch(
          new LibraryUpdatesReceived({
            comics: [UPDATED_COMIC],
            lastReadDates: [],
            rescanCount: 0,
            processingCount: 0
          })
        );
      });

      it('updates the current comic', () => {
        adaptor.currentComic$.subscribe(response =>
          expect(response).toEqual(UPDATED_COMIC)
        );
      });
    });
  });

  it('fires an action when starting a rescan', () => {
    adaptor.startRescan();
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryStartRescan()
    );
  });

  it('fires an action when updating a comic', () => {
    adaptor.saveComic(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryUpdateComic({ comic: COMIC })
    );
  });

  it('fires an action when clearing metadata from a comic', () => {
    adaptor.clearMetadata(COMIC);
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryClearMetadata({ comic: COMIC })
    );
  });

  describe('when setting the blocked state for a hash', () => {
    it('fires an action when blocking', () => {
      adaptor.blockPageHash(HASH);
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryActions.LibraryBlockPageHash({ hash: HASH, blocked: true })
      );
    });

    it('fires an action when unblocking', () => {
      adaptor.unblockPageHash(HASH);
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryActions.LibraryBlockPageHash({ hash: HASH, blocked: false })
      );
    });
  });

  it('fires an action when deleting multiple comics', () => {
    adaptor.deleteComics(IDS);
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryDeleteMultipleComics({ ids: IDS })
    );
  });

  it('fires an action when getting a comic by id', () => {
    adaptor.getComic(17);
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryFindCurrentComic({ id: 17 })
    );
  });

  describe('when getting comics in a series', () => {
    beforeEach(() => {
      store.dispatch(
        new LibraryUpdatesReceived({
          comics: COMICS,
          lastReadDates: [],
          rescanCount: 0,
          processingCount: 0
        })
      );
    });

    it('can get the next comic', () => {
      expect(adaptor.getNextIssue(COMIC_2)).toEqual(COMIC_3);
    });

    it('can get the previous comic', () => {
      expect(adaptor.getPreviousIssue(COMIC_3)).toEqual(COMIC_2);
    });
  });
});
