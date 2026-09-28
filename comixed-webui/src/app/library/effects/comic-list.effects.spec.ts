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
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideMockStore } from '@ngrx/store/testing';
import { LoadComicListResponse } from '@app/library/models/net/load-comic-list-response';
import { COMIC_1 } from '@app/library/library-fixtures';
import { ComicListActions } from '@app/library/actions/comic-list.actions';
import { LibraryService } from '@app/library/services/library-service';
import { AlertService } from '@app/services/alert-service';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { ComicListEffects } from '@app/library/effects/comic-list.effects';
import { expect, vi } from 'vitest';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';

describe('ComicListEffects', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_COMIC_LIST = [TEST_COMIC];
  const TEST_TOTAL_COUNT = 717;
  const TEST_FILTER_COUNT = 129;
  const TEST_COVER_MONTH_LIST = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEAR_LIST = [1965, 1971, 1986, 1996, 1998, 2006];
  const TEST_INDEX = 17;
  const TEST_SIZE = 50;
  const TEST_SORT_BY = 'publisher';
  const TEST_SORT_DIRECTION = 'desc';
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let actions$: Observable<unknown>;
  let effects: ComicListEffects;
  let libraryService: LibraryService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicListEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        LibraryService,
        MessageService,
        AlertService
      ]
    });

    effects = TestBed.inject(ComicListEffects);
    libraryService = TestBed.inject(LibraryService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a list of comics by filter', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        coverMonths: TEST_COVER_MONTH_LIST,
        coverYears: TEST_COVER_YEAR_LIST,
        totalCount: TEST_TOTAL_COUNT,
        filteredCount: TEST_FILTER_COUNT
      } as LoadComicListResponse;
      const action = ComicListActions.loadByFilters({
        pageSize: 10,
        pageIndex: 5,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        unscrapedState: false,
        missing: false,
        searchText: '',
        publisher: '',
        series: '',
        volume: '',
        pageCount: null,
        sortBy: '',
        sortDirection: ''
      });
      const outcome = ComicListActions.loadSuccess({
        comicList: TEST_COMIC_LIST,
        coverMonthList: TEST_COVER_MONTH_LIST,
        coverYearList: TEST_COVER_YEAR_LIST,
        totalCount: TEST_TOTAL_COUNT,
        filterCount: TEST_FILTER_COUNT
      });

      const loadSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadByFilters$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        pageSize: 10,
        pageIndex: 5,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        unscrapedState: false,
        missing: false,
        searchText: '',
        publisher: '',
        series: '',
        volume: '',
        pageCount: null,
        sortBy: '',
        sortDirection: ''
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ComicListActions.loadByFilters({
        pageSize: 10,
        pageIndex: 5,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        unscrapedState: false,
        missing: false,
        searchText: '',
        publisher: '',
        series: '',
        volume: '',
        pageCount: null,
        sortBy: '',
        sortDirection: ''
      });
      const outcome = ComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadByFilters$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        pageSize: 10,
        pageIndex: 5,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        unscrapedState: false,
        missing: false,
        searchText: '',
        publisher: '',
        series: '',
        volume: '',
        pageCount: null,
        sortBy: '',
        sortDirection: ''
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ComicListActions.loadByFilters({
        pageSize: 10,
        pageIndex: 5,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        unscrapedState: false,
        missing: false,
        searchText: '',
        publisher: '',
        series: '',
        volume: '',
        pageCount: null,
        sortBy: '',
        sortDirection: ''
      });
      const outcome = ComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadByFilters$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        pageSize: 10,
        pageIndex: 5,
        coverYear: null,
        coverMonth: null,
        archiveType: null,
        comicType: null,
        comicState: null,
        selected: false,
        unscrapedState: false,
        missing: false,
        searchText: '',
        publisher: '',
        series: '',
        volume: '',
        pageCount: null,
        sortBy: '',
        sortDirection: ''
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('loading a list of comics by read state', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        coverMonths: TEST_COVER_MONTH_LIST,
        coverYears: TEST_COVER_YEAR_LIST,
        totalCount: TEST_TOTAL_COUNT,
        filteredCount: TEST_FILTER_COUNT
      } as LoadComicListResponse;
      const action = ComicListActions.loadByReadState({
        unreadOnly: true,
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = ComicListActions.loadSuccess({
        comicList: TEST_COMIC_LIST,
        coverMonthList: TEST_COVER_MONTH_LIST,
        coverYearList: TEST_COVER_YEAR_LIST,
        totalCount: TEST_TOTAL_COUNT,
        filterCount: TEST_FILTER_COUNT
      });

      const loadSpy = vi
        .spyOn(libraryService, 'loadByReadState')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadByReadState$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        unreadOnly: true,
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ComicListActions.loadByReadState({
        unreadOnly: true,
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = ComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(libraryService, 'loadByReadState')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadByReadState$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        unreadOnly: true,
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ComicListActions.loadByReadState({
        unreadOnly: true,
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      const outcome = ComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(libraryService, 'loadByReadState')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadByReadState$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        unreadOnly: true,
        pageIndex: TEST_INDEX,
        pageSize: TEST_SIZE,
        sortBy: TEST_SORT_BY,
        sortDirection: TEST_SORT_DIRECTION
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
