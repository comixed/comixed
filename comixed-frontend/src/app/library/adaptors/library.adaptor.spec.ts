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

import { LibraryAdaptor } from './library.adaptor';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import * as LibraryActions from '../actions/library.actions';
import {
  LibraryGetUpdates,
  LibraryUpdatesReceived
} from '../actions/library.actions';
import { AppState } from 'app/library';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/models/comic.fixtures';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { extractField } from 'app/library/utility.functions';
import { ComicGetIssue, ComicGotIssue } from 'app/comics/actions/comic.actions';
import { ComicsModule } from 'app/comics/comics.module';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { MessageService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Comic } from 'app/comics';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('LibraryAdaptor', () => {
  const PAGE = 17;
  const COUNT = 100;
  const SORT_FIELD = 'series';
  const ASCENDING = false;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];
  const LAST_COMIC_ID = 467;
  const PROCESSING_COUNT = 222;
  const MOST_RECENT_UPDATE = new Date();
  const MORE_UPDATES = false;
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const LATEST_UPDATED_DATE = new Date();
  const COMIC_COUNT = 3072;
  const COMIC = COMIC_1;
  const IDS = [7, 17, 65, 1, 29, 71];

  let adaptor: LibraryAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
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
          lastReadDates: []
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
      const PUBLISHERS = extractField(COMICS, 'publisher');
      const SERIES = extractField(COMICS, 'series');
      const CHARACTERS = extractField(COMICS, 'characters');
      const TEAMS = extractField(COMICS, 'teams');
      const LOCATIONS = extractField(COMICS, 'locations');
      const STORIES = extractField(COMICS, 'storyArcs');
      const PENDING_RESCANS = 17;

      beforeEach(() => {
        store.dispatch(
          new LibraryUpdatesReceived({
            comics: COMICS,
            lastComicId: LAST_COMIC_ID,
            mostRecentUpdate: MOST_RECENT_UPDATE,
            moreUpdates: MORE_UPDATES,
            lastReadDates: LAST_READ_DATES,
            processingCount: PROCESSING_COUNT
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
            processingCount: 7
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

  it('fires an action when deleting multiple comics', () => {
    adaptor.deleteComics(IDS);
    expect(store.dispatch).toHaveBeenCalledWith(
      new LibraryActions.LibraryDeleteMultipleComics({ ids: IDS })
    );
  });

  describe('when getting comics in a series', () => {
    beforeEach(() => {
      store.dispatch(
        new LibraryUpdatesReceived({
          comics: COMICS,
          lastComicId: LAST_COMIC_ID,
          moreUpdates: MORE_UPDATES,
          mostRecentUpdate: MOST_RECENT_UPDATE,
          lastReadDates: [],
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
