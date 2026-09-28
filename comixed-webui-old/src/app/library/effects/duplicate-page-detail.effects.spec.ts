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
import { DuplicatePageDetailEffects } from './duplicate-page-detail.effects';
import { DuplicatePageService } from '@app/library/services/duplicate-page.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DUPLICATE_PAGE_1 } from '@app/library/library.fixtures';
import {
  duplicatePageDetailLoaded,
  loadDuplicatePageDetail,
  loadDuplicatePageDetailFailed
} from '@app/library/actions/duplicate-page-detail.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('DuplicatePageDetailEffects', () => {
  const DETAIL = DUPLICATE_PAGE_1;

  let actions$: Observable<any>;
  let effects: DuplicatePageDetailEffects;
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
        DuplicatePageDetailEffects,
        provideMockActions(() => actions$),
        {
          provide: DuplicatePageService,
          useValue: {
            loadDuplicatePageDetail: jasmine.createSpy(
              'DuplicatePageService.loadDuplicatePageDetail()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(DuplicatePageDetailEffects);
    duplicatePageService = TestBed.inject(
      DuplicatePageService
    ) as jasmine.SpyObj<DuplicatePageService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the detail for a duplicate page', () => {
    it('fires an action on success', () => {
      const serviceResponse = DETAIL;
      const action = loadDuplicatePageDetail({ hash: DETAIL.hash });
      const outcome = duplicatePageDetailLoaded({ detail: DETAIL });

      actions$ = hot('-a', { a: action });
      duplicatePageService.loadDuplicatePageDetail.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicatePageDetail$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadDuplicatePageDetail({ hash: DETAIL.hash });
      const outcome = loadDuplicatePageDetailFailed();

      actions$ = hot('-a', { a: action });
      duplicatePageService.loadDuplicatePageDetail.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicatePageDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadDuplicatePageDetail({ hash: DETAIL.hash });
      const outcome = loadDuplicatePageDetailFailed();

      actions$ = hot('-a', { a: action });
      duplicatePageService.loadDuplicatePageDetail.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadDuplicatePageDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
