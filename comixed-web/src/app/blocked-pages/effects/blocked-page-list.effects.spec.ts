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
import { BlockedPageListEffects } from './blocked-page-list.effects';
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BLOCKED_PAGE_1,
  BLOCKED_PAGE_3,
  BLOCKED_PAGE_5
} from '@app/blocked-pages/blocked-pages.fixtures';
import {
  blockedPageListLoaded,
  loadBlockedPageList,
  loadBlockedPageListFailed
} from '@app/blocked-pages/actions/blocked-page-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('BlockedPageListEffects', () => {
  const ENTRIES = [BLOCKED_PAGE_1, BLOCKED_PAGE_3, BLOCKED_PAGE_5];

  let actions$: Observable<any>;
  let effects: BlockedPageListEffects;
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
        BlockedPageListEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            loadAll: jasmine.createSpy('BlockedPageService.loadAll()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(BlockedPageListEffects);
    blockedPageService = TestBed.inject(
      BlockedPageService
    ) as jasmine.SpyObj<BlockedPageService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the blocked page list', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = loadBlockedPageList();
      const outcome = blockedPageListLoaded({ entries: ENTRIES });

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadBlockedPageList();
      const outcome = loadBlockedPageListFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadBlockedPageList();
      const outcome = loadBlockedPageListFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
