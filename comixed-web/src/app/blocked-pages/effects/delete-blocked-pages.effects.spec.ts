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
import { DeleteBlockedPagesEffects } from './delete-blocked-pages.effects';
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BLOCKED_PAGE_1,
  BLOCKED_PAGE_3,
  BLOCKED_PAGE_5
} from '@app/blocked-pages/blocked-pages.fixtures';
import {
  blockedPagesDeleted,
  deleteBlockedPages,
  deleteBlockedPagesFailed
} from '@app/blocked-pages/actions/delete-blocked-pages.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/core/services/alert.service';

describe('DeleteBlockedPagesEffects', () => {
  const ENTRIES = [BLOCKED_PAGE_1, BLOCKED_PAGE_3, BLOCKED_PAGE_5];

  let actions$: Observable<any>;
  let effects: DeleteBlockedPagesEffects;
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
        DeleteBlockedPagesEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            deleteEntries: jasmine.createSpy(
              'BlockedPageService.deleteEntries()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(DeleteBlockedPagesEffects);
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

  describe('deleting blocked pages', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = deleteBlockedPages({ entries: ENTRIES });
      const outcome = blockedPagesDeleted();

      actions$ = hot('-a', { a: action });
      blockedPageService.deleteEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteEntries$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteBlockedPages({ entries: ENTRIES });
      const outcome = deleteBlockedPagesFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.deleteEntries.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteBlockedPages({ entries: ENTRIES });
      const outcome = deleteBlockedPagesFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.deleteEntries.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
