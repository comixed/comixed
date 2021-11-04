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
import { BlockedHashListEffects } from './blocked-hash-list.effects';
import { BlockedPageService } from '@app/comic-pages/services/blocked-page.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_3,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';
import {
  blockedHashListLoaded,
  loadBlockedHashList,
  loadBlockedHashListFailed,
  markPagesWithHash,
  markPagesWithHashFailed,
  pagesWithHashMarked
} from '@app/comic-pages/actions/blocked-hash-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

describe('BlockedHashListEffects', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const HASHES = ENTRIES.map(entry => entry.hash);
  const DELETED = Math.random() > 0.5;

  let actions$: Observable<any>;
  let effects: BlockedHashListEffects;
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
        BlockedHashListEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            loadAll: jasmine.createSpy('BlockedPageService.loadAll()'),
            markPagesWithHash: jasmine.createSpy(
              'BlockedPageService.markPagesWithHash()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(BlockedHashListEffects);
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

  describe('loading the blocked page list', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = loadBlockedHashList();
      const outcome = blockedHashListLoaded({ entries: ENTRIES });

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadBlockedHashList();
      const outcome = loadBlockedHashListFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadBlockedHashList();
      const outcome = loadBlockedHashListFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('marking pages with hashes', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = markPagesWithHash({
        hashes: HASHES,
        deleted: DELETED
      });
      const outcome = pagesWithHashMarked();

      actions$ = hot('-a', { a: action });
      blockedPageService.markPagesWithHash
        .withArgs({ hashes: HASHES, deleted: DELETED })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.markPagesWithHash$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = markPagesWithHash({
        hashes: HASHES,
        deleted: DELETED
      });
      const outcome = markPagesWithHashFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.markPagesWithHash
        .withArgs({ hashes: HASHES, deleted: DELETED })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.markPagesWithHash$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = markPagesWithHash({
        hashes: HASHES,
        deleted: DELETED
      });
      const outcome = markPagesWithHashFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.markPagesWithHash
        .withArgs({ hashes: HASHES, deleted: DELETED })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.markPagesWithHash$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
