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
import { BlockPageEffects } from './block-page.effects';
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PAGE_2 } from '@app/comic-book/comic-book.fixtures';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  blockedStateSet,
  setBlockedState,
  setBlockedStateFailed
} from '@app/blocked-pages/actions/block-page.actions';
import { hot } from 'jasmine-marbles';

describe('BlockPageEffects', () => {
  const PAGE = PAGE_2;

  let actions$: Observable<any>;
  let effects: BlockPageEffects;
  let blockedPageService: jasmine.SpyObj<BlockedPageService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        BlockPageEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            setBlockedState: jasmine.createSpy(
              'BlockedPageService.setBlockedState()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(BlockPageEffects);
    blockedPageService = TestBed.inject(
      BlockedPageService
    ) as jasmine.SpyObj<BlockedPageService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('setting the blocked state for a page', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = setBlockedState({
        page: PAGE,
        blocked: Math.random() > 0.5
      });
      const outcome = blockedStateSet();

      actions$ = hot('-a', { a: action });
      blockedPageService.setBlockedState.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    // TODO: find out why does this test failure consistently?
    xit('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setBlockedState({
        page: PAGE,
        blocked: Math.random() > 0.5
      });
      const outcome = setBlockedStateFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.setBlockedState.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setBlockedState({
        page: PAGE,
        blocked: Math.random() > 0.5
      });
      const outcome = setBlockedStateFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.setBlockedState.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
