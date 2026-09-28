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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertService } from '@app/services/alert-service';
import { LibraryService } from '@app/library/services/library-service';
import { PublisherComicListEffects } from '@app/library/effects/publisher-comic-list.effects';
import { PublisherComicListActions } from '@app/library/actions/publisher-comic-list.actions';
import { COMIC_1 } from '@app/library/library-fixtures';
import { LoadComicListResponse } from '@app/library/models/net/load-comic-list-response';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import { MessageService } from '@openng/optimus-ui/api';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';

describe('PublisherComicListEffects', () => {
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };
  const TEST_PUBLISHER_NAME = 'The Publisher';
  const TEST_INDEX = 3;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'name';
  const TEST_SORT_DIRECTION = 'asc';
  const TEST_COMIC_LIST = [COMIC_1];
  const TEST_COVER_MONTH_LIST = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEAR_LIST = [1965, 1971, 1986, 1996, 1998, 2006];
  const TEST_TOTAL = 921;
  const TEST_FILTERED_TOTAL = 320;

  let actions$: Observable<unknown>;
  let effects: PublisherComicListEffects;
  let libraryService: LibraryService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublisherComicListEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        LibraryService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(PublisherComicListEffects);
    libraryService = TestBed.inject(LibraryService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading comics', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        coverMonths: TEST_COVER_MONTH_LIST,
        coverYears: TEST_COVER_YEAR_LIST,
        totalCount: TEST_TOTAL,
        filteredCount: TEST_FILTERED_TOTAL
      } as LoadComicListResponse;
      const action = PublisherComicListActions.load({
        publisherName: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherComicListActions.loadSuccess({
        entries: TEST_COMIC_LIST,
        coverMonthList: TEST_COVER_MONTH_LIST,
        coverYearList: TEST_COVER_YEAR_LIST,
        total: TEST_TOTAL,
        filteredTotal: TEST_FILTERED_TOTAL
      });

      const loadSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        missing: false,
        unscrapedState: false,
        searchText: null,
        publisher: TEST_PUBLISHER_NAME,
        series: null,
        volume: null,
        pageCount: null,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = PublisherComicListActions.load({
        publisherName: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        missing: false,
        unscrapedState: false,
        searchText: null,
        publisher: TEST_PUBLISHER_NAME,
        series: null,
        volume: null,
        pageCount: null,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = PublisherComicListActions.load({
        publisherName: TEST_PUBLISHER_NAME,
        index: TEST_INDEX,
        size: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = PublisherComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        missing: false,
        unscrapedState: false,
        searchText: null,
        publisher: TEST_PUBLISHER_NAME,
        series: null,
        volume: null,
        pageCount: null,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
