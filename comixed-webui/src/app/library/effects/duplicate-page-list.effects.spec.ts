/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { DuplicatePageListEffects } from './duplicate-page-list.effects';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { DuplicatePageService } from '@app/library/services/duplicate-page.service';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  duplicatePagesLoaded,
  loadDuplicatePages,
  loadDuplicatePagesFailed
} from '@app/library/actions/duplicate-page-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import {
  DUPLICATE_PAGE_1,
  DUPLICATE_PAGE_2,
  DUPLICATE_PAGE_3
} from '@app/library/library.fixtures';

describe('DuplicatePageListEffects', () => {
  const PAGES = [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2, DUPLICATE_PAGE_3];

  let actions$: Observable<any>;
  let effects: DuplicatePageListEffects;
  let duplicatePageService: jasmine.SpyObj<DuplicatePageService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        DuplicatePageListEffects,
        provideMockActions(() => actions$),
        {
          provide: DuplicatePageService,
          useValue: {
            loadDuplicatePages: jasmine.createSpy(
              'DuplicatePageService.loadDuplicatePages()'
            )
          }
        }
      ]
    });

    effects = TestBed.inject(DuplicatePageListEffects);
    duplicatePageService = TestBed.inject(
      DuplicatePageService
    ) as jasmine.SpyObj<DuplicatePageService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading comics with duplicate pages', () => {
    it('fires an action on success', () => {
      const serviceResponse = PAGES;
      const action = loadDuplicatePages();
      const outcome = duplicatePagesLoaded({ pages: PAGES });

      actions$ = hot('-a', { a: action });
      duplicatePageService.loadDuplicatePages.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsWithDuplicatePages$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadDuplicatePages();
      const outcome = loadDuplicatePagesFailed();

      actions$ = hot('-a', { a: action });
      duplicatePageService.loadDuplicatePages.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsWithDuplicatePages$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadDuplicatePages();
      const outcome = loadDuplicatePagesFailed();

      actions$ = hot('-a', { a: action });
      duplicatePageService.loadDuplicatePages.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicsWithDuplicatePages$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
