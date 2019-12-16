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

import { CollectionAdaptor } from './collection.adaptor';
import { CollectionType } from 'app/library/models/collection-type.enum';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3,
  COLLECTION_ENTRY_4,
  COLLECTION_ENTRY_5
} from 'app/library/models/collection-entry.fixtures';
import { COMIC_1, COMIC_2, COMIC_3 } from 'app/comics/models/comic.fixtures';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import {
  COLLECTION_FEATURE_KEY,
  reducer
} from 'app/library/reducers/collection.reducer';
import { EffectsModule } from '@ngrx/effects';
import { CollectionEffects } from 'app/library/effects/collection.effects';
import { AppState } from 'app/library';
import {
  CollectionComicsReceived,
  CollectionGetComics,
  CollectionGetComicsFailed,
  CollectionLoad,
  CollectionLoadFailed,
  CollectionReceived
} from 'app/library/actions/collection.actions';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('CollectionAdaptor', () => {
  const COLLECTION_TYPE = CollectionType.STORIES;
  const COLLECTION_ENTRIES = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3,
    COLLECTION_ENTRY_4,
    COLLECTION_ENTRY_5
  ];
  const COLLECTION_NAME = 'Fancy Publisher';
  const PAGE = 17;
  const COUNT = 25;
  const SORT_FIELD = 'addedDate';
  const ASCENDING = false;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];
  const COMIC_COUNT = 3;

  let adaptor: CollectionAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(COLLECTION_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([CollectionEffects])
      ],
      providers: [CollectionAdaptor, MessageService]
    });

    adaptor = TestBed.get(CollectionAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('getting all entries for a collection', () => {
    beforeEach(() => {
      adaptor.getCollection(COLLECTION_TYPE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new CollectionLoad({ collectionType: COLLECTION_TYPE })
      );
    });

    it('provides updates', () => {
      adaptor.fetchingEntries$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new CollectionReceived({ entries: COLLECTION_ENTRIES }));
      });

      it('provides updates', () => {
        adaptor.fetchingEntries$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the entries', () => {
        adaptor.entries$.subscribe(response =>
          expect(response).toEqual(COLLECTION_ENTRIES)
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new CollectionLoadFailed());
      });

      it('provides updates', () => {
        adaptor.fetchingEntries$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('getting a page of comics for a collection', () => {
    beforeEach(() => {
      adaptor.getPageForEntry(
        COLLECTION_TYPE,
        COLLECTION_NAME,
        PAGE,
        COUNT,
        SORT_FIELD,
        ASCENDING
      );
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new CollectionGetComics({
          collectionType: COLLECTION_TYPE,
          name: COLLECTION_NAME,
          page: PAGE,
          count: COUNT,
          sortField: SORT_FIELD,
          ascending: ASCENDING
        })
      );
    });

    it('provides updates', () => {
      adaptor.fetchingEntry$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(
          new CollectionComicsReceived({
            comics: COMICS,
            comicCount: COMIC_COUNT
          })
        );
      });

      it('provides updates', () => {
        adaptor.fetchingEntry$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('updates the list of comics', () => {
        adaptor.comics$.subscribe(response => expect(response).toEqual(COMICS));
      });

      it('updates the comic count', () => {
        adaptor.comicCount$.subscribe(response =>
          expect(response).toEqual(COMIC_COUNT)
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new CollectionGetComicsFailed());
      });

      it('provides updates', () => {
        adaptor.fetchingEntry$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });
});
