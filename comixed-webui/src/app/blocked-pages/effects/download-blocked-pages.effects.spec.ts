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
import { DownloadBlockedPagesEffects } from './download-blocked-pages.effects';
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { AlertService } from '@app/core/services/alert.service';
import { BLOCKED_PAGE_FILE } from '@app/blocked-pages/blocked-pages.fixtures';
import {
  blockedPagesDownloaded,
  downloadBlockedPages,
  downloadBlockedPagesFailed
} from '@app/blocked-pages/actions/download-blocked-pages.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FileSaverService } from 'ngx-filesaver';

describe('DownloadBlockedPagesEffects', () => {
  const DOWNLOADED_FILE = BLOCKED_PAGE_FILE;

  let actions$: Observable<any>;
  let effects: DownloadBlockedPagesEffects;
  let blockedPageService: jasmine.SpyObj<BlockedPageService>;
  let alertService: AlertService;
  let fileSaverService: FileSaverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        DownloadBlockedPagesEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            downloadFile: jasmine.createSpy('BlockedPageService.downloadFile()')
          }
        },
        AlertService,
        FileSaverService
      ]
    });

    effects = TestBed.inject(DownloadBlockedPagesEffects);
    blockedPageService = TestBed.inject(
      BlockedPageService
    ) as jasmine.SpyObj<BlockedPageService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
    fileSaverService = TestBed.inject(FileSaverService);
    spyOn(fileSaverService, 'save');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('downloading a blocked page file', () => {
    it('fires an action on success', () => {
      const serviceResponse = BLOCKED_PAGE_FILE;
      const action = downloadBlockedPages();
      const outcome = blockedPagesDownloaded({ document: DOWNLOADED_FILE });

      actions$ = hot('-a', { a: action });
      blockedPageService.downloadFile.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadFile$).toBeObservable(expected);
      expect(fileSaverService.save).toHaveBeenCalledWith(
        jasmine.anything(),
        DOWNLOADED_FILE.filename
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = downloadBlockedPages();
      const outcome = downloadBlockedPagesFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.downloadFile.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadFile$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = downloadBlockedPages();
      const outcome = downloadBlockedPagesFailed();

      actions$ = hot('-a', { a: action });
      blockedPageService.downloadFile.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.downloadFile$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
