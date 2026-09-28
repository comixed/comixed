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
import { CollectionService } from '@app/library/services/collection-service';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { LoadPublisherListResponse } from '@app/library/models/net/load-publisher-list-response';
import { PUBLISHER_1 } from '@app/library/library-fixtures';
import { PublisherListActions } from '@app/library/actions/publisher-list.actions';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { PublisherListEffects } from '@app/library/effects/publisher-list.effects';
import { expect, it, vi } from 'vitest';

describe('PublisherListEffects', () => {
  const TEST_PUBLISHER_LIST = [PUBLISHER_1];
  const TEST_TOTAL = 320;
  const TEST_SEARCH_TEXT = 'the search text';
  const TEST_PAGE = 4;
  const TEST_SIZE = 10;
  const TEST_SORT_BY = 'name';
  const TEST_SORT_DIRECTION = 'asc';

  let actions$: Observable<unknown>;
  let effects: PublisherListEffects;
  let collectionService: CollectionService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublisherListEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        CollectionService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(PublisherListEffects);
    collectionService = TestBed.inject(CollectionService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the publisher list', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        publishers: TEST_PUBLISHER_LIST,
        total: TEST_TOTAL
      } as LoadPublisherListResponse;
      const action = PublisherListActions.load({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherListActions.loadSuccess({
        publishers: TEST_PUBLISHER_LIST,
        total: TEST_TOTAL
      });

      const loadSpy = vi
        .spyOn(collectionService, 'loadPublisherList')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = PublisherListActions.load({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherListActions.loadFailure();

      const loadSpy = vi
        .spyOn(collectionService, 'loadPublisherList')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = PublisherListActions.load({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherListActions.loadFailure();

      const loadSpy = vi
        .spyOn(collectionService, 'loadPublisherList')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
