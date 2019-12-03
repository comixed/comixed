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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { CollectionEffects } from './collection.effects';
import { CollectionService } from 'app/library/services/collection.service';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import {
  COLLECTION_FEATURE_KEY,
  reducer
} from 'app/library/reducers/collection.reducer';
import { EffectsModule } from '@ngrx/effects';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3,
  COLLECTION_ENTRY_4,
  COLLECTION_ENTRY_5
} from 'app/library/models/collection-entry.fixtures';
import {
  CollectionComicsReceived,
  CollectionGetComics,
  CollectionGetComicsFailed,
  CollectionLoad,
  CollectionLoadFailed,
  CollectionReceived
} from 'app/library/actions/collection.actions';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { COMIC_1, COMIC_2, COMIC_3 } from 'app/comics/models/comic.fixtures';
import { GetCollectionPageResponse } from 'app/library/models/net/get-collection-page-response';
import objectContaining = jasmine.objectContaining;

describe('CollectionEffects', () => {
  const COLLECTION_TYPE = CollectionType.CHARACTERS;
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

  let actions$: Observable<any>;
  let effects: CollectionEffects;
  let collectionService: jasmine.SpyObj<CollectionService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(COLLECTION_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([CollectionEffects])
      ],
      providers: [
        CollectionEffects,
        provideMockActions(() => actions$),
        {
          provide: CollectionService,
          useValue: {
            getEntries: jasmine.createSpy('CollectionService.getEntries()'),
            getPageForEntry: jasmine.createSpy(
              'CollectionService.getPageForEntry()'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(CollectionEffects);
    collectionService = TestBed.get(CollectionService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting all entries for a collection', () => {
    it('fires an action on success', () => {
      const serviceResponse = COLLECTION_ENTRIES;
      const action = new CollectionLoad({ collectionType: COLLECTION_TYPE });
      const outcome = new CollectionReceived({ entries: COLLECTION_ENTRIES });

      actions$ = hot('-a', { a: action });
      collectionService.getEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getEntries$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new CollectionLoad({ collectionType: COLLECTION_TYPE });
      const outcome = new CollectionLoadFailed();

      actions$ = hot('-a', { a: action });
      collectionService.getEntries.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getEntries$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new CollectionLoad({ collectionType: COLLECTION_TYPE });
      const outcome = new CollectionLoadFailed();

      actions$ = hot('-a', { a: action });
      collectionService.getEntries.and.throwError('expect');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getEntries$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('getting comics for a collection type', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comics: COMICS,
        comicCount: COMIC_COUNT
      } as GetCollectionPageResponse;
      const action = new CollectionGetComics({
        collectionType: COLLECTION_TYPE,
        name: COLLECTION_NAME,
        page: PAGE,
        count: COUNT,
        sortField: SORT_FIELD,
        ascending: ASCENDING
      });
      const outcome = new CollectionComicsReceived({
        comics: COMICS,
        comicCount: COMIC_COUNT
      });

      actions$ = hot('-a', { a: action });
      collectionService.getPageForEntry.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getPageForEntry$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new CollectionGetComics({
        collectionType: COLLECTION_TYPE,
        name: COLLECTION_NAME,
        page: PAGE,
        count: COUNT,
        sortField: SORT_FIELD,
        ascending: ASCENDING
      });
      const outcome = new CollectionGetComicsFailed();

      actions$ = hot('-a', { a: action });
      collectionService.getPageForEntry.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.getPageForEntry$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new CollectionGetComics({
        collectionType: COLLECTION_TYPE,
        name: COLLECTION_NAME,
        page: PAGE,
        count: COUNT,
        sortField: SORT_FIELD,
        ascending: ASCENDING
      });
      const outcome = new CollectionGetComicsFailed();

      actions$ = hot('-a', { a: action });
      collectionService.getPageForEntry.and.throwError('expect');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getPageForEntry$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
