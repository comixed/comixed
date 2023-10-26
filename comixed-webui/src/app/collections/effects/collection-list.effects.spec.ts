/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { CollectionListEffects } from './collection-list.effects';
import { CollectionService } from '@app/collections/services/collection.service';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3,
  COLLECTION_ENTRY_4,
  COLLECTION_ENTRY_5
} from '@app/collections/collections.fixtures';
import { TagType } from '@app/collections/models/comic-collection.enum';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { LoadCollectionEntriesResponse } from '@app/collections/models/net/load-collection-entries-response';
import {
  loadCollectionList,
  loadCollectionListFailure,
  loadCollectionListSuccess
} from '@app/collections/actions/collection-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('CollectionListEffects', () => {
  const COLLECTION_ENTRIES = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3,
    COLLECTION_ENTRY_4,
    COLLECTION_ENTRY_5
  ];
  const TAG_TYPE = TagType.TEAMS;
  const PAGE_SIZE = 25;
  const PAGE_INDEX = 10;
  const SORT_BY = 'comic-count';
  const SORT_DIRECTION = 'desc';
  const TOTAL_ENTRIES = Math.floor(Math.random() * 1000);

  let actions$: Observable<any>;
  let effects: CollectionListEffects;
  let collectionListService: jasmine.SpyObj<CollectionService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        CollectionListEffects,
        provideMockActions(() => actions$),
        {
          provide: CollectionService,
          useValue: {
            loadCollectionEntries: jasmine.createSpy(
              'CollectionService.loadCollectionEntries()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(CollectionListEffects);
    collectionListService = TestBed.inject(
      CollectionService
    ) as jasmine.SpyObj<CollectionService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading collection entries', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        entries: COLLECTION_ENTRIES,
        totalEntries: TOTAL_ENTRIES
      } as LoadCollectionEntriesResponse;
      const action = loadCollectionList({
        tagType: TAG_TYPE,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadCollectionListSuccess({
        entries: COLLECTION_ENTRIES,
        totalEntries: TOTAL_ENTRIES
      });

      actions$ = hot('-a', { a: action });
      collectionListService.loadCollectionEntries
        .withArgs({
          tagType: TAG_TYPE,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadCollectionList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadCollectionList({
        tagType: TAG_TYPE,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadCollectionListFailure();

      actions$ = hot('-a', { a: action });
      collectionListService.loadCollectionEntries
        .withArgs({
          tagType: TAG_TYPE,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadCollectionList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadCollectionList({
        tagType: TAG_TYPE,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadCollectionListFailure();

      actions$ = hot('-a', { a: action });
      collectionListService.loadCollectionEntries
        .withArgs({
          tagType: TAG_TYPE,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadCollectionList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
