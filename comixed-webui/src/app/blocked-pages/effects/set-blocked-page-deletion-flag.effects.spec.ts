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

import { SetBlockedPageDeletionFlagEffects } from './set-blocked-page-deletion-flag.effects';
import {
  BLOCKED_PAGE_1,
  BLOCKED_PAGE_2,
  BLOCKED_PAGE_3
} from '@app/blocked-pages/blocked-pages.fixtures';
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SetBlockedPageDeletionFlagResponse } from '@app/blocked-pages/models/net/set-blocked-page-deletion-flag-response';
import {
  blockedPageDeletionFlagsSet,
  setBlockedPageDeletionFlags,
  setBlockedPageDeletionFlagsFailed
} from '@app/blocked-pages/actions/set-blocked-page-deletion-flag.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('SetBlockedPageDeletionFlagEffects', () => {
  const HASHES = [BLOCKED_PAGE_1, BLOCKED_PAGE_2, BLOCKED_PAGE_3].map(
    page => page.hash
  );
  const DELETED = Math.random() > 0.5;
  const PAGE_COUNT = Math.abs(Math.ceil(Math.random() * 100));

  let actions$: Observable<any>;
  let effects: SetBlockedPageDeletionFlagEffects;
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
        SetBlockedPageDeletionFlagEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            setDeletedFlag: jasmine.createSpy(
              'BlockedPageService.setDeletedFlag()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(SetBlockedPageDeletionFlagEffects);
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

  describe('setting the deleted flag', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        deleted: DELETED,
        pageCount: PAGE_COUNT
      } as SetBlockedPageDeletionFlagResponse;
      const action = setBlockedPageDeletionFlags({
        hashes: HASHES,
        deleted: DELETED
      });
      const outcome = blockedPageDeletionFlagsSet();

      actions$ = hot('-a', { a: action });
      blockedPageService.setDeletedFlag.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setBlockedPageDeletionFlags$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setBlockedPageDeletionFlags({
        hashes: HASHES,
        deleted: DELETED
      });
      const outcome = setBlockedPageDeletionFlagsFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.setDeletedFlag.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.setBlockedPageDeletionFlags$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setBlockedPageDeletionFlags({
        hashes: HASHES,
        deleted: DELETED
      });
      const outcome = setBlockedPageDeletionFlagsFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.setDeletedFlag.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setBlockedPageDeletionFlags$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
