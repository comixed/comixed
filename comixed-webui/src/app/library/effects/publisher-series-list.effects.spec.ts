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
import { PublisherSeriesListEffects } from './publisher-series-list.effects';
import { expect, it, vi } from 'vitest';
import { LoadPublisherSeriesListResponse } from '@app/library/models/net/load-publisher-series-list-response';
import { SERIES_1, SERIES_2 } from '@app/library/library-fixtures';
import { PublisherSeriesListActions } from '@app/library/actions/publisher-series-list.actions';
import { CollectionService } from '@app/library/services/collection-service';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';

describe('PublisherSeriesListEffects', () => {
  const TEST_PUBLISHER_NAME = 'The Publisher';
  const TEST_INDEX = 7;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'name';
  const TEST_SORT_DIRECTION = 'asc';
  const TEST_SERIES_LIST = [SERIES_1, SERIES_2];
  const TEST_TOTAL = 417;

  let actions$: Observable<unknown>;
  let effects: PublisherSeriesListEffects;
  let collectionService: CollectionService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublisherSeriesListEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        CollectionService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(PublisherSeriesListEffects);
    collectionService = TestBed.inject(CollectionService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        entries: TEST_SERIES_LIST,
        totalSeries: TEST_TOTAL
      } as LoadPublisherSeriesListResponse;
      const action = PublisherSeriesListActions.load({
        name: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherSeriesListActions.loadSuccess({
        entries: TEST_SERIES_LIST,
        total: TEST_TOTAL
      });

      const loadSpy = vi
        .spyOn(collectionService, 'loadPublisherSeriesList')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        name: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = PublisherSeriesListActions.load({
        name: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherSeriesListActions.loadFailure();

      const loadSpy = vi
        .spyOn(collectionService, 'loadPublisherSeriesList')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        name: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = PublisherSeriesListActions.load({
        name: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherSeriesListActions.loadFailure();

      const loadSpy = vi
        .spyOn(collectionService, 'loadPublisherSeriesList')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        name: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
