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
import { UploadBlockedPagesEffects } from './upload-blocked-pages.effects';
import { BlockedPageService } from '@app/comic-pages/services/blocked-page.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_3,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';
import {
  blockedPagesUploaded,
  uploadBlockedPages,
  uploadBlockedPagesFailed
} from '@app/comic-pages/actions/upload-blocked-pages.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { blockedHashListLoaded } from '@app/comic-pages/actions/blocked-hash-list.actions';

describe('UploadBlockedPagesEffects', () => {
  const FILE = new File([], 'testing');
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];

  let actions$: Observable<any>;
  let effects: UploadBlockedPagesEffects;
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
        UploadBlockedPagesEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            uploadFile: jasmine.createSpy('BlockedPageService.uploadFile()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(UploadBlockedPagesEffects);
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

  describe('uploading a blocked page file', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = uploadBlockedPages({ file: FILE });
      const outcome1 = blockedPagesUploaded({ entries: ENTRIES });
      const outcome2 = blockedHashListLoaded({ entries: ENTRIES });

      actions$ = hot('-a', { a: action });
      blockedPageService.uploadFile.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.uploadFile$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = uploadBlockedPages({ file: FILE });
      const outcome = uploadBlockedPagesFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.uploadFile.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.uploadFile$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = uploadBlockedPages({ file: FILE });
      const outcome = uploadBlockedPagesFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.uploadFile.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.uploadFile$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
