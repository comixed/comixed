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
import { ComicListEffects } from './comic-list.effects';
import { hot } from 'vitest-marbles';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideMockStore } from '@ngrx/store/testing';
import { LoadComicListResponse } from '@app/library/models/net/load-comic-list-response';
import { COMIC_1 } from '@app/library/library-fixtures';
import { ComicListActions } from '@app/library/actions/comic-list.actions';
import { LibraryService } from '@app/library/services/library-service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/services/alert-service';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';

describe.todo('ComicListEffects', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_COMIC_LIST = [TEST_COMIC];
  const TEST_TOTAL_COUNT = 717;
  const TEST_FILTER_COUNT = 129;
  const TEST_COVER_MONTH_LIST = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEAR_LIST = [1965, 1971, 1986, 1996, 1998, 2006];
  const initialState = {};

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
    it('should fire an action on success', () => {
      const serviceResponse = {
        comics: TEST_COMIC_LIST,
        totalCount: TEST_TOTAL_COUNT,
        filteredCount: TEST_FILTER_COUNT,
        coverMonths: TEST_COVER_MONTH_LIST,
        coverYears: TEST_COVER_YEAR_LIST
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
        totalCount: TEST_TOTAL_COUNT,
        filterCount: TEST_FILTER_COUNT,
        coverMonthList: TEST_COVER_MONTH_LIST,
        coverYearList: TEST_COVER_YEAR_LIST
      });

      actions$ = hot('-a', { a: action });
      const loadByFilterSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockReturnValue(of(serviceResponse));
      expect(
        effects.loadComicListByFilters$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadByFilterSpy).toHaveBeenCalledWith({
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
    });

    it('should fire an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
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

      actions$ = hot('-a', { a: action });
      const loadByFilterSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.loadComicListByFilters$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadByFilterSpy).toHaveBeenCalledWith({
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
        expect(errorSpy).toHaveBeenCalled();
      });
    });

    it('should fire an action on general failure', () => {
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

      actions$ = hot('-a', { a: action });
      const loadByFilterSpy = vi
        .spyOn(libraryService, 'loadComicListByFilter')
        .mockThrow(new Error());
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.loadComicListByFilters$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadByFilterSpy).toHaveBeenCalledWith({
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
        expect(errorSpy).toHaveBeenCalled();
      });
    });
  });
});
