/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { DuplicateComicsEffects } from './duplicate-comics.effects';
import { DuplicateComicService } from '@app/library/services/duplicate-comic.service';
import { LoadDuplicateComicsListResponse } from '@app/library/models/net/load-duplicate-comics-list-response';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2,
  DUPLICATE_COMIC_3,
  DUPLICATE_COMIC_4,
  DUPLICATE_COMIC_5
} from '@app/library/library.fixtures';
import {
  loadDuplicateComicList,
  loadDuplicateComicListFailure,
  loadDuplicateComicListSuccess,
  loadDuplicateComics,
  loadDuplicateComicsFailure,
  loadDuplicateComicsSuccess
} from '@app/library/actions/duplicate-comics.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { LoadComicsResponse } from '@app/comic-books/models/net/load-comics-response';
import {
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { loadComicsSuccess } from '@app/comic-books/actions/comic-list.actions';

describe('DuplicateComicsEffects', () => {
  const DUPLICATE_COMIC_LIST = [
    DUPLICATE_COMIC_1,
    DUPLICATE_COMIC_2,
    DUPLICATE_COMIC_3,
    DUPLICATE_COMIC_4,
    DUPLICATE_COMIC_5
  ];
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const PAGE_SIZE = 25;
  const PAGE_INDEX = 4;
  const SORT_BY = '';
  const SORT_DIRECTION = '';

  let actions$: Observable<any>;
  let effects: DuplicateComicsEffects;
  let duplicateComicService: jasmine.SpyObj<DuplicateComicService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        DuplicateComicsEffects,
        provideMockActions(() => actions$),
        {
          provide: DuplicateComicService,
          useValue: {
            loadDuplicateComicList: jasmine.createSpy(
              'DuplicateComicService.loadDuplicateComicList()'
            ),
            loadDuplicateComics: jasmine.createSpy(
              'DuplicateComicService.loadDuplicateComics()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(DuplicateComicsEffects);
    duplicateComicService = TestBed.inject(
      DuplicateComicService
    ) as jasmine.SpyObj<DuplicateComicService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the list of duplicate comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comics: DUPLICATE_COMIC_LIST,
        totalCount: DUPLICATE_COMIC_LIST.length
      } as LoadDuplicateComicsListResponse;
      const action = loadDuplicateComicList({
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadDuplicateComicListSuccess({
        entries: DUPLICATE_COMIC_LIST,
        total: DUPLICATE_COMIC_LIST.length
      });

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComicList
        .withArgs({
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicateComicList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadDuplicateComicList({
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadDuplicateComicListFailure();

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComicList
        .withArgs({
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicateComicList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadDuplicateComicList({
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadDuplicateComicListFailure();

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComicList
        .withArgs({
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expect');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadDuplicateComicList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading a duplicated comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comics: COMIC_LIST,
        coverMonths: [],
        coverYears: [],
        totalCount: COMIC_LIST.length,
        filteredCount: COMIC_LIST.length
      } as LoadComicsResponse;
      const action = loadDuplicateComics({
        publisher: DUPLICATE_COMIC_1.publisher,
        series: DUPLICATE_COMIC_1.series,
        volume: DUPLICATE_COMIC_1.volume,
        issueNumber: DUPLICATE_COMIC_1.issueNumber,
        coverDate: DUPLICATE_COMIC_1.coverDate,
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome1 = loadDuplicateComicsSuccess();
      const outcome2 = loadComicsSuccess({
        comics: COMIC_LIST,
        coverMonths: [],
        coverYears: [],
        totalCount: COMIC_LIST.length,
        filteredCount: COMIC_LIST.length
      });

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics
        .withArgs({
          publisher: DUPLICATE_COMIC_1.publisher,
          series: DUPLICATE_COMIC_1.series,
          volume: DUPLICATE_COMIC_1.volume,
          issueNumber: DUPLICATE_COMIC_1.issueNumber,
          coverDate: DUPLICATE_COMIC_1.coverDate,
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadDuplicateComics$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadDuplicateComics({
        publisher: DUPLICATE_COMIC_1.publisher,
        series: DUPLICATE_COMIC_1.series,
        volume: DUPLICATE_COMIC_1.volume,
        issueNumber: DUPLICATE_COMIC_1.issueNumber,
        coverDate: DUPLICATE_COMIC_1.coverDate,
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadDuplicateComicsFailure();

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics
        .withArgs({
          publisher: DUPLICATE_COMIC_1.publisher,
          series: DUPLICATE_COMIC_1.series,
          volume: DUPLICATE_COMIC_1.volume,
          issueNumber: DUPLICATE_COMIC_1.issueNumber,
          coverDate: DUPLICATE_COMIC_1.coverDate,
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicateComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadDuplicateComics({
        publisher: DUPLICATE_COMIC_1.publisher,
        series: DUPLICATE_COMIC_1.series,
        volume: DUPLICATE_COMIC_1.volume,
        issueNumber: DUPLICATE_COMIC_1.issueNumber,
        coverDate: DUPLICATE_COMIC_1.coverDate,
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadDuplicateComicsFailure();

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics
        .withArgs({
          publisher: DUPLICATE_COMIC_1.publisher,
          series: DUPLICATE_COMIC_1.series,
          volume: DUPLICATE_COMIC_1.volume,
          issueNumber: DUPLICATE_COMIC_1.issueNumber,
          coverDate: DUPLICATE_COMIC_1.coverDate,
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expeted');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadDuplicateComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
