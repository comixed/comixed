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
import { BlockedHashesEffects } from './blocked-hashes.effects';
import { BlockedPageService } from '@app/comic-pages/services/blocked-page.service';
import { AlertService } from '@app/core/services/alert.service';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_3,
  BLOCKED_HASH_4,
  BLOCKED_HASH_5,
  BLOCKED_PAGE_FILE,
  PAGE_2
} from '@app/comic-pages/comic-pages.fixtures';
import {
  downloadBlockedHashesFile,
  downloadBlockedHashesFileFailure,
  downloadBlockedHashesFileSuccess,
  loadBlockedHashDetail,
  loadBlockedHashDetailFailure,
  loadBlockedHashDetailSuccess,
  loadBlockedHashList,
  loadBlockedHashListFailure,
  loadBlockedHashListSuccess,
  markPagesWithHash,
  markPagesWithHashFailure,
  markPagesWithHashSuccess,
  saveBlockedHash,
  saveBlockedHashFailure,
  saveBlockedHashSuccess,
  setBlockedStateForHash,
  setBlockedStateForHashFailue,
  setBlockedStateForHashSuccess,
  uploadBlockedHashesFile,
  uploadBlockedHashesFileFailure,
  uploadBlockedHashesFileSuccess
} from '@app/comic-pages/actions/blocked-hashes.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FileDownloadService } from '@app/core/services/file-download.service';

describe('BlockedHashesEffects', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const HASHES = ENTRIES.map(entry => entry.hash);
  const DELETED = Math.random() > 0.5;
  const DOWNLOADED_FILE = BLOCKED_PAGE_FILE;
  const UPLOADED_FILE = new File([], 'testing');
  const ENTRY = BLOCKED_HASH_4;
  const PAGE = PAGE_2;

  let actions$: Observable<any>;
  let effects: BlockedHashesEffects;
  let blockedPageService: jasmine.SpyObj<BlockedPageService>;
  let alertService: AlertService;
  let fileDownloadService: FileDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        BlockedHashesEffects,
        provideMockActions(() => actions$),
        {
          provide: BlockedPageService,
          useValue: {
            loadAll: jasmine.createSpy('BlockedPageService.loadAll()'),
            loadByHash: jasmine.createSpy('BlockedPageService.loadByHash()'),
            save: jasmine.createSpy('BlockedPageService.save()'),
            markPagesWithHash: jasmine.createSpy(
              'BlockedPageService.markPagesWithHash()'
            ),
            downloadFile: jasmine.createSpy(
              'BlockedPageService.downloadFile()'
            ),
            uploadFile: jasmine.createSpy('BlockedPageService.uploadFile()'),
            setBlockedState: jasmine.createSpy(
              'BlockedPageService.setBlockedState()'
            )
          }
        },
        AlertService,
        FileDownloadService
      ]
    });

    effects = TestBed.inject(BlockedHashesEffects);
    blockedPageService = TestBed.inject(
      BlockedPageService
    ) as jasmine.SpyObj<BlockedPageService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
    fileDownloadService = TestBed.inject(FileDownloadService);
    spyOn(fileDownloadService, 'saveFile');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the blocked page list', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = loadBlockedHashList();
      const outcome = loadBlockedHashListSuccess({ entries: ENTRIES });

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadBlockedHashList();
      const outcome = loadBlockedHashListFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadBlockedHashList();
      const outcome = loadBlockedHashListFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading a blocked page by hash', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRY;
      const action = loadBlockedHashDetail({ hash: ENTRY.hash });
      const outcome = loadBlockedHashDetailSuccess({ entry: ENTRY });

      actions$ = hot('-a', { a: action });
      blockedPageService.loadByHash.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadByHash$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadBlockedHashDetail({ hash: ENTRY.hash });
      const outcome = loadBlockedHashDetailFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.loadByHash.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadByHash$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadBlockedHashDetail({ hash: ENTRY.hash });
      const outcome = loadBlockedHashDetailFailure();

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
      const action = saveBlockedHash({ entry: ENTRY });
      const outcome = saveBlockedHashSuccess({ entry: ENTRY });

      actions$ = hot('-a', { a: action });
      blockedPageService.save.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveBlockedHash({ entry: ENTRY });
      const outcome = saveBlockedHashFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.save.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveBlockedHash({ entry: ENTRY });
      const outcome = saveBlockedHashFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.save.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
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
      const outcome = markPagesWithHashSuccess();

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
      const outcome = markPagesWithHashFailure();

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
      const outcome = markPagesWithHashFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.markPagesWithHash
        .withArgs({ hashes: HASHES, deleted: DELETED })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.markPagesWithHash$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('downloading a blocked page file', () => {
    it('fires an action on success', () => {
      const serviceResponse = DOWNLOADED_FILE;
      const action = downloadBlockedHashesFile();
      const outcome = downloadBlockedHashesFileSuccess({
        document: DOWNLOADED_FILE
      });

      actions$ = hot('-a', { a: action });
      blockedPageService.downloadFile.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadFile$).toBeObservable(expected);
      expect(fileDownloadService.saveFile).toHaveBeenCalledWith({
        document: DOWNLOADED_FILE
      });
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = downloadBlockedHashesFile();
      const outcome = downloadBlockedHashesFileFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.downloadFile.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadFile$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = downloadBlockedHashesFile();
      const outcome = downloadBlockedHashesFileFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.downloadFile.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.downloadFile$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('uploading a blocked page file', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = uploadBlockedHashesFile({ file: UPLOADED_FILE });
      const outcome1 = uploadBlockedHashesFileSuccess({ entries: ENTRIES });
      const outcome2 = loadBlockedHashListSuccess({ entries: ENTRIES });

      actions$ = hot('-a', { a: action });
      blockedPageService.uploadFile.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.uploadFile$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = uploadBlockedHashesFile({ file: UPLOADED_FILE });
      const outcome = uploadBlockedHashesFileFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.uploadFile.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.uploadFile$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = uploadBlockedHashesFile({ file: UPLOADED_FILE });
      const outcome = uploadBlockedHashesFileFailure();

      actions$ = hot('-a', { a: action });
      blockedPageService.uploadFile.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.uploadFile$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('setting the blocked state for a page', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = setBlockedStateForHash({
        hashes: [PAGE.hash],
        blocked: Math.random() > 0.5
      });
      const outcome = setBlockedStateForHashSuccess();

      actions$ = hot('-a', { a: action });
      blockedPageService.setBlockedState.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setBlockedStateForHash({
        hashes: [PAGE.hash],
        blocked: Math.random() > 0.5
      });
      const outcome = setBlockedStateForHashFailue();

      actions$ = hot('-a', { a: action });
      blockedPageService.setBlockedState.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setBlockedStateForHash({
        hashes: [PAGE.hash],
        blocked: Math.random() > 0.5
      });
      const outcome = setBlockedStateForHashFailue();

      actions$ = hot('-a', { a: action });
      blockedPageService.setBlockedState.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setBlockedState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
