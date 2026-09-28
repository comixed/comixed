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
import { Observable, of, tap, throwError } from 'rxjs';
import { PublisherListEffects } from './publisher-list.effects';
import { hot } from 'vitest-marbles';
import { CollectionService } from '@app/library/services/collection-service';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { LoadPublisherListResponse } from '@app/library/models/net/load-publisher-list-response';
import { PUBLISHER_1 } from '@app/library/library-fixtures';
import { PublisherListActions } from '@app/library/actions/publisher-list.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';

describe.todo('PublisherListEffects', () => {
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
    it('should fire an action on success', () => {
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

      actions$ = hot('-a', { a: action });
      const loadPublisherListSpy = vi
        .spyOn(collectionService, 'loadPublisherList')
        .mockReturnValue(of(serviceResponse));
      expect(
        effects.load$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadPublisherListSpy).toHaveBeenCalledWith({
          searchText: TEST_SEARCH_TEXT,
          page: TEST_PAGE,
          size: TEST_SIZE,
          sortBy: TEST_SORT_BY,
          sortDirection: TEST_SORT_DIRECTION
        });
      });
    });

    it('should fire an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = PublisherListActions.load({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherListActions.loadFailure();

      actions$ = hot('-a', { a: action });
      const loadPublisherListSpy = vi
        .spyOn(collectionService, 'loadPublisherList')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.load$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadPublisherListSpy).toHaveBeenCalledWith({
          searchText: TEST_SEARCH_TEXT,
          page: TEST_PAGE,
          size: TEST_SIZE,
          sortBy: TEST_SORT_BY,
          sortDirection: TEST_SORT_DIRECTION
        });
        expect(errorSpy).toHaveBeenCalled();
      });
    });

    it('should fire an action on general failure', () => {
      const action = PublisherListActions.load({
        searchText: TEST_SEARCH_TEXT,
        page: TEST_PAGE,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherListActions.loadFailure();

      actions$ = hot('-a', { a: action });
      const loadPublisherListSpy = vi
        .spyOn(collectionService, 'loadPublisherList')
        .mockThrow(new Error());
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.load$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadPublisherListSpy).toHaveBeenCalledWith({
          searchText: TEST_SEARCH_TEXT,
          page: TEST_PAGE,
          size: TEST_SIZE,
          sortBy: TEST_SORT_BY,
          sortDirection: TEST_SORT_DIRECTION
        });
        expect(errorSpy).toHaveBeenCalled();
      });
    });
  });
});
