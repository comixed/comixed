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
import { DuplicateComicEffects } from './duplicate-comic.effects';
import { DuplicateComicService } from '@app/library/services/duplicate-comic.service';
import { LoadDuplicateComicsResponse } from '@app/library/models/net/load-duplicate-comics-response';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2,
  DUPLICATE_COMIC_3,
  DUPLICATE_COMIC_4,
  DUPLICATE_COMIC_5
} from '@app/library/library.fixtures';
import {
  loadDuplicateComics,
  loadDuplicateComicsFailure,
  loadDuplicateComicsSuccess
} from '@app/library/actions/duplicate-comic.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';

describe('DuplicateComicEffects', () => {
  const DUPLICATE_COMIC_LIST = [
    DUPLICATE_COMIC_1,
    DUPLICATE_COMIC_2,
    DUPLICATE_COMIC_3,
    DUPLICATE_COMIC_4,
    DUPLICATE_COMIC_5
  ];
  const PAGE_SIZE = 25;
  const PAGE_INDEX = 4;
  const SORT_BY = '';
  const SORT_DIRECTION = '';

  let actions$: Observable<any>;
  let effects: DuplicateComicEffects;
  let duplicateComicService: jasmine.SpyObj<DuplicateComicService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        DuplicateComicEffects,
        provideMockActions(() => actions$),
        {
          provide: DuplicateComicService,
          useValue: {
            loadDuplicateComics: jasmine.createSpy(
              'DuplicateComicService.loadDuplicateComics()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(DuplicateComicEffects);
    duplicateComicService = TestBed.inject(
      DuplicateComicService
    ) as jasmine.SpyObj<DuplicateComicService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading duplicate comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comics: DUPLICATE_COMIC_LIST,
        totalCount: DUPLICATE_COMIC_LIST.length
      } as LoadDuplicateComicsResponse;
      const action = loadDuplicateComics({
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadDuplicateComicsSuccess({
        entries: DUPLICATE_COMIC_LIST,
        total: DUPLICATE_COMIC_LIST.length
      });

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics
        .withArgs({
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicateComics$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadDuplicateComics({
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadDuplicateComicsFailure();

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics
        .withArgs({
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
        pageIndex: PAGE_INDEX,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadDuplicateComicsFailure();

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics
        .withArgs({
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expect');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadDuplicateComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
