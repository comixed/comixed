/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { TagListEffects } from './tag-list.effects';
import { expect, it, vi } from 'vitest';
import { CollectionService } from '@app/library/services/collection-service';
import { AlertService } from '@app/services/alert-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { LoadCollectionEntriesResponse } from '@app/library/models/net/load-collection-entries-response';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3
} from '@app/library/library-fixtures';
import { TagListActions } from '@app/library/actions/tag-list.actions';
import { ComicTagType } from '@app/library/models/comic-tag-type';

describe('TagListEffects', () => {
  const TEST_TAG_TYPE = ComicTagType.CHARACTER;
  const TEST_SEARCH_TEXT = 'The Search Text';
  const TEST_INDEX = 17;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'value';
  const TEST_SORT_DIRECTION = 'desc';
  const TEST_COLLECTION_ENTRIES = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3
  ];
  const TEST_TOTAL = 417;

  let actions$: Observable<unknown>;
  let effects: TagListEffects;
  let collectionService: CollectionService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TagListEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        CollectionService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(TagListEffects);
    collectionService = TestBed.inject(CollectionService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the tag values', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        entries: TEST_COLLECTION_ENTRIES,
        totalEntries: TEST_TOTAL
      } as LoadCollectionEntriesResponse;
      const action = TagListActions.load({
        tagType: TEST_TAG_TYPE,
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = TagListActions.loadSuccess({
        entries: TEST_COLLECTION_ENTRIES,
        total: TEST_TOTAL
      });

      const loadSpy = vi
        .spyOn(collectionService, 'loadCollectionEntryList')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadTagLists$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        tagType: TEST_TAG_TYPE,
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = TagListActions.load({
        tagType: TEST_TAG_TYPE,
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = TagListActions.loadFailure();

      const loadSpy = vi
        .spyOn(collectionService, 'loadCollectionEntryList')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadTagLists$)).resolves.toEqual(
        outcome
      );

      expect(loadSpy).toHaveBeenCalledWith({
        tagType: TEST_TAG_TYPE,
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = TagListActions.load({
        tagType: TEST_TAG_TYPE,
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = TagListActions.loadFailure();

      const loadSpy = vi
        .spyOn(collectionService, 'loadCollectionEntryList')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadTagLists$)).resolves.toEqual(
        outcome
      );

      expect(loadSpy).toHaveBeenCalledWith({
        tagType: TEST_TAG_TYPE,
        searchText: TEST_SEARCH_TEXT,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
