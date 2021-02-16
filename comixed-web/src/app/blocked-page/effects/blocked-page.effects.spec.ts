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
import { BlockedPageEffects } from './blocked-page.effects';
import { PAGE_1, PAGE_2, PAGE_3, PAGE_4 } from '@app/library/library.fixtures';
import { AlertService } from '@app/core';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  pageBlockSet,
  setPageBlock,
  setPageBlockFailed
} from '@app/blocked-page/actions/blocked-page.actions';
import { hot } from 'jasmine-marbles';
import { BlockedPageService } from '@app/blocked-page/services/blocked-page.service';

describe('BlockedPageEffects', () => {
  const HASHES = [PAGE_1.hash, PAGE_2.hash, PAGE_3.hash, PAGE_4.hash];
  const PAGE = PAGE_1;
  const BLOCKED = Math.random() > 0.5;

  let actions$: Observable<any>;
  let effects: BlockedPageEffects;
  let pageService: jasmine.SpyObj<BlockedPageService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        BlockedPageEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            setBlockedState: jasmine.createSpy('PageService.setBlockedState()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(BlockedPageEffects);
    pageService = TestBed.inject(BlockedPageService) as jasmine.SpyObj<
      BlockedPageService
    >;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('setting the blocked state for a page', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = setPageBlock({ page: PAGE, blocked: BLOCKED });
      const outcome = pageBlockSet();

      actions$ = hot('-a', { a: action });
      pageService.setBlockedState.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setPageBlock({ page: PAGE, blocked: BLOCKED });
      const outcome = setPageBlockFailed();

      actions$ = hot('-a', { a: action });
      pageService.setBlockedState.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setPageBlock({ page: PAGE, blocked: BLOCKED });
      const outcome = setPageBlockFailed();

      actions$ = hot('-a', { a: action });
      pageService.setBlockedState.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
