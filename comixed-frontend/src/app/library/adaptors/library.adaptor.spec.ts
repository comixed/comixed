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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Comic } from 'app/comics';
import { ComicGetIssue, ComicGotIssue } from 'app/comics/actions/comic.actions';
import { ComicsModule } from 'app/comics/comics.module';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/models/comic.fixtures';
import { AppState } from 'app/library';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { extractField } from 'app/library/library.functions';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import * as LibraryActions from '../actions/library.actions';
import {
  LibraryClearImageCache,
  LibraryClearImageCacheFailed,
  LibraryComicsConverting,
  LibraryConvertComics,
  LibraryConvertComicsFailed,
  LibraryDeleteMultipleComicsFailed,
  LibraryGetUpdates,
  LibraryImageCacheCleared,
  LibraryMultipleComicsDeleted,
  LibraryMultipleComicsUndeleted,
  LibraryUndeleteMultipleComicsFailed,
  LibraryUpdatesReceived
} from '../actions/library.actions';
import { LibraryAdaptor } from './library.adaptor';
import { CollectionType } from 'app/library/models/collection-type.enum';
import {
  READING_LIST_1,
  READING_LIST_2
} from 'app/comics/models/reading-list.fixtures';

describe('LibraryAdaptor', () => {
  const ASCENDING = false;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];
  const LAST_COMIC_ID = 467;
  const PROCESSING_COUNT = 222;
  const MOST_RECENT_UPDATE = new Date();
  const MORE_UPDATES = false;
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const COMIC = COMIC_1;
  const IDS = [7, 17, 65, 1, 29, 71];
  const ARCHIVE_TYPE = 'CBZ';
  const RENAME_PAGES = true;
  const DELETE_PAGES = false;
  const READING_LISTS = [READING_LIST_1, READING_LIST_2];
  const DELETE_ORIGINAL_COMIC = Math.random() * 100 > 50;

  let adaptor: LibraryAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects])
      ],
      providers: [LibraryAdaptor, MessageService]
    });

    adaptor = TestBed.get(LibraryAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('getting library updates', () => {
    beforeEach(() => {
      store.dispatch(
        new LibraryUpdatesReceived({
          lastComicId: LAST_COMIC_ID,
          mostRecentUpdate: MOST_RECENT_UPDATE,
          moreUpdates: MORE_UPDATES,
          processingCount: PROCESSING_COUNT,
          comics: [],
          lastReadDates: [],
          readingLists: []
        })
      );
      adaptor.getLibraryUpdates();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryGetUpdates({
          lastUpdateDate: MOST_RECENT_UPDATE,
          timeout: 60,
          maximumComics: 100,
          processingCount: PROCESSING_COUNT,
          lastComicId: LAST_COMIC_ID
        })
      );
    });

    it('provides notification', () => {
      adaptor.fetchingUpdate$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('when updates are received', () => {
      const PUBLISHERS = extractField(COMICS, CollectionType.PUBLISHERS);
      const SERIES = extractField(COMICS, CollectionType.SERIES);
      const CHARACTERS = extractField(COMICS, CollectionType.CHARACTERS);
      const TEAMS = extractField(COMICS, CollectionType.TEAMS);
      const LOCATIONS = extractField(COMICS, CollectionType.LOCATIONS);
      const STORIES = extractField(COMICS, CollectionType.STORIES);

      beforeEach(() => {
        store.dispatch(
          new LibraryUpdatesReceived({
            comics: COMICS,
            lastComicId: LAST_COMIC_ID,
            mostRecentUpdate: MOST_RECENT_UPDATE,
            moreUpdates: MORE_UPDATES,
            lastReadDates: LAST_READ_DATES,
            processingCount: PROCESSING_COUNT,
            readingLists: READING_LISTS
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

      it('updates the processing count', () => {
        adaptor.processingCount$.subscribe(response =>
          expect(response).toEqual(PROCESSING_COUNT)
        );
      });

      it('provides updates on publishers', () => {
        adaptor.publishers$.subscribe(result =>
          expect(result).toEqual(PUBLISHERS)
        );
      });

      it('provides updates on series', () => {
        adaptor.series$.subscribe(result => expect(result).toEqual(SERIES));
      });

      it('provides updates on characters', () => {
        adaptor.characters$.subscribe(result =>
          expect(result).toEqual(CHARACTERS)
        );
      });

      it('provides updates on teams', () => {
        adaptor.teams$.subscribe(result => expect(result).toEqual(TEAMS));
      });

      it('provides updates on locations', () => {
        adaptor.locations$.subscribe(result =>
          expect(result).toEqual(LOCATIONS)
        );
      });

      it('provides updates on story arcs', () => {
        adaptor.stories$.subscribe(result => expect(result).toEqual(STORIES));
      });

      it('provides updates on the reading lists', () => {
        adaptor.readingLists$.subscribe(result =>
          expect(result).not.toEqual([])
        );
      });
    });

    describe('when one of the updates is the current comic', () => {
      const UPDATED_COMIC: Comic = {
        ...COMIC,
        lastUpdatedDate: new Date().getTime()
      };

      beforeEach(() => {
        store.dispatch(new ComicGotIssue({ comic: COMIC }));
        store.dispatch(
          new LibraryUpdatesReceived({
            comics: [UPDATED_COMIC],
            lastComicId: LAST_COMIC_ID,
            moreUpdates: MORE_UPDATES,
            mostRecentUpdate: MOST_RECENT_UPDATE,
            lastReadDates: LAST_READ_DATES,
            processingCount: 7,
            readingLists: READING_LISTS
          })
        );
      });

      it('fires an update action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new ComicGetIssue({ id: UPDATED_COMIC.id })
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

  it('fires an action when starting a rescan', () => {
    adaptor.startRescan();
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryStartRescan()
    );
  });

  describe('deleting multiple comics', () => {
    beforeEach(() => {
      adaptor.deleteComics(IDS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryActions.LibraryDeleteMultipleComics({ ids: IDS })
      );
    });

    it('provides updates', () => {
      adaptor.deleting$.subscribe(response => expect(response).toBeTruthy());
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new LibraryMultipleComicsDeleted({ count: 17 }));
      });

      it('provides updates', () => {
        adaptor.deleting$.subscribe(response => expect(response).toBeFalsy());
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new LibraryDeleteMultipleComicsFailed());
      });

      it('provides updates', () => {
        adaptor.deleting$.subscribe(response => expect(response).toBeFalsy());
      });
    });
  });

  describe('undeleting multiple comics', () => {
    beforeEach(() => {
      adaptor.undeleteComics(IDS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryActions.LibraryUndeleteMultipleComics({ ids: IDS })
      );
    });

    it('provides updates', () => {
      adaptor.deleting$.subscribe(response => expect(response).toBeTruthy());
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new LibraryMultipleComicsUndeleted());
      });

      it('provides updates', () => {
        adaptor.deleting$.subscribe(response => expect(response).toBeFalsy());
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new LibraryUndeleteMultipleComicsFailed());
      });

      it('provides updates', () => {
        adaptor.deleting$.subscribe(response => expect(response).toBeFalsy());
      });
    });
  });

  describe('converting comics', () => {
    beforeEach(() => {
      adaptor.convertComics(
        COMICS,
        ARCHIVE_TYPE,
        RENAME_PAGES,
        DELETE_PAGES,
        DELETE_ORIGINAL_COMIC
      );
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryConvertComics({
          comics: COMICS,
          archiveType: ARCHIVE_TYPE,
          renamePages: RENAME_PAGES,
          deletePages: DELETE_PAGES,
          deleteOriginal: DELETE_ORIGINAL_COMIC
        })
      );
    });

    it('provides updates on conversion', () => {
      adaptor.converting$.subscribe(response => expect(response).toBeTruthy());
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new LibraryComicsConverting());
      });

      it('provides updates on conversion', () => {
        adaptor.converting$.subscribe(response => expect(response).toBeFalsy());
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new LibraryConvertComicsFailed());
      });

      it('provides updates on conversion', () => {
        adaptor.converting$.subscribe(response => expect(response).toBeFalsy());
      });
    });
  });

  describe('clearing the image cache', () => {
    beforeEach(() => {
      adaptor.clearImageCache();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new LibraryClearImageCache());
    });

    it('provides updates on clearing the image cache', () => {
      adaptor.clearingImageCache$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new LibraryImageCacheCleared());
      });

      it('provides updates on clearing the image cache', () => {
        adaptor.clearingImageCache$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new LibraryClearImageCacheFailed());
      });

      it('provides updates on clearing the image cache', () => {
        adaptor.clearingImageCache$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });
});
