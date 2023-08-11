/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import {
  duplicateComicsLoaded,
  loadDuplicateComics,
  loadDuplicateComicsFailed
} from '@app/library/actions/duplicate-comic.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('DuplicateComicEffects', () => {
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];

  let actions$: Observable<any>;
  let effects: DuplicateComicEffects;
  let duplicateComicService: jasmine.SpyObj<DuplicateComicService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
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
      const serviceResponse = COMIC_DETAILS;
      const action = loadDuplicateComics();
      const outcome = duplicateComicsLoaded({ comics: COMIC_DETAILS });

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicateComics$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadDuplicateComics();
      const outcome = loadDuplicateComicsFailed();

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicateComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadDuplicateComics();
      const outcome = loadDuplicateComicsFailed();

      actions$ = hot('-a', { a: action });
      duplicateComicService.loadDuplicateComics.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadDuplicateComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
