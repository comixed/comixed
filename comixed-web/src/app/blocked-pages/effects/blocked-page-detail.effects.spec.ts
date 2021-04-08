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

import { BlockedPageDetailEffects } from './blocked-page-detail.effects';
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { AlertService } from '@app/core';
import { LoggerModule } from '@angular-ru/logger';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BLOCKED_PAGE_4 } from '@app/blocked-pages/blocked-pages.fixtures';
import {
  blockedPageLoaded,
  blockedPageSaved,
  loadBlockedPageByHash,
  loadBlockedPageFailed,
  saveBlockedPage,
  saveBlockedPageFailed
} from '@app/blocked-pages/actions/blocked-page-detail.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('BlockedPageEffects', () => {
  const ENTRY = BLOCKED_PAGE_4;

  let actions$: Observable<any>;
  let effects: BlockedPageDetailEffects;
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
        BlockedPageDetailEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            loadByHash: jasmine.createSpy('BlockedPageService.loadByHash()'),
            save: jasmine.createSpy('BlockedPageService.save()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(BlockedPageDetailEffects);
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

  describe('loading a blocked page by hash', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRY;
      const action = loadBlockedPageByHash({ hash: ENTRY.hash });
      const outcome = blockedPageLoaded({ entry: ENTRY });

      actions$ = hot('-a', { a: action });
      blockedPageService.loadByHash.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadByHash$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadBlockedPageByHash({ hash: ENTRY.hash });
      const outcome = loadBlockedPageFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadByHash.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadByHash$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadBlockedPageByHash({ hash: ENTRY.hash });
      const outcome = loadBlockedPageFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadByHash.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadByHash$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('saving a blocked page', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRY;
      const action = saveBlockedPage({ entry: ENTRY });
      const outcome = blockedPageSaved({ entry: ENTRY });

      actions$ = hot('-a', { a: action });
      blockedPageService.save.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveBlockedPage({ entry: ENTRY });
      const outcome = saveBlockedPageFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.save.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveBlockedPage({ entry: ENTRY });
      const outcome = saveBlockedPageFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.save.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
