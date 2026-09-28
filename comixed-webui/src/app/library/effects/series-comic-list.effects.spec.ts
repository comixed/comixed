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
import { SeriesComicListEffects } from './series-comic-list.effects';
import { expect, it, vi } from 'vitest';
import { CollectionService } from '@app/library/services/collection-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { ISSUE_1, ISSUE_2 } from '@app/library/library-fixtures';
import { SeriesComicListActions } from '@app/library/actions/series-comic-list.actions';

describe('SeriesComicListEffects', () => {
  const TEST_PUBLISHER_NAME = 'The Publisher';
  const TEST_SERIES_NAME = 'The Series';
  const TEST_VOLUME = '2026';
  const TEST_ISSUE_LIST = [ISSUE_1, ISSUE_2];

  let actions$: Observable<unknown>;
  let effects: SeriesComicListEffects;
  let collectionService: CollectionService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeriesComicListEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        CollectionService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(SeriesComicListEffects);
    collectionService = TestBed.inject(CollectionService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_ISSUE_LIST;
      const action = SeriesComicListActions.load({
        publisherName: TEST_PUBLISHER_NAME,
        seriesName: TEST_SERIES_NAME,
        volume: TEST_VOLUME
      });
      const outcome = SeriesComicListActions.loadSuccess({
        entries: TEST_ISSUE_LIST
      });

      const loadSpy = vi
        .spyOn(collectionService, 'loadSeriesComicList')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.loadSeriesComicLists$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        publisherName: TEST_PUBLISHER_NAME,
        seriesName: TEST_SERIES_NAME,
        volume: TEST_VOLUME
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = SeriesComicListActions.load({
        publisherName: TEST_PUBLISHER_NAME,
        seriesName: TEST_SERIES_NAME,
        volume: TEST_VOLUME
      });
      const outcome = SeriesComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(collectionService, 'loadSeriesComicList')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.loadSeriesComicLists$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        publisherName: TEST_PUBLISHER_NAME,
        seriesName: TEST_SERIES_NAME,
        volume: TEST_VOLUME
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = SeriesComicListActions.load({
        publisherName: TEST_PUBLISHER_NAME,
        seriesName: TEST_SERIES_NAME,
        volume: TEST_VOLUME
      });
      const outcome = SeriesComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(collectionService, 'loadSeriesComicList')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.loadSeriesComicLists$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        publisherName: TEST_PUBLISHER_NAME,
        seriesName: TEST_SERIES_NAME,
        volume: TEST_VOLUME
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
