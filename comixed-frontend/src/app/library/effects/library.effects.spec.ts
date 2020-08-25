/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { TranslateModule } from '@ngx-translate/core';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/models/comic.fixtures';
import {
  LibraryClearImageCache,
  LibraryClearImageCacheFailed,
  LibraryComicsConverting,
  LibraryConvertComics,
  LibraryConvertComicsFailed,
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryImageCacheCleared,
  LibraryMultipleComicsDeleted,
  LibraryMultipleComicsUndeleted,
  LibraryRescanStarted,
  LibraryStartRescan,
  LibraryStartRescanFailed,
  LibraryUndeleteMultipleComics,
  LibraryUndeleteMultipleComicsFailed,
  LibraryUpdatesReceived
} from 'app/library/actions/library.actions';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { LibraryService } from 'app/library/services/library.service';
import { cold, hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';
import { LibraryEffects } from './library.effects';
import { ClearImageCacheResponse } from 'app/library/models/net/clear-image-cache-response';
import { UndeleteMultipleComicsResponse } from 'app/library/models/net/undelete-multiple-comics-response';
import objectContaining = jasmine.objectContaining;

describe('LibraryEffects', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_COMIC_ID = 2716;
  const MOST_RECENT_UPDATE = new Date();
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const COUNT = 25;
  const ASCENDING = false;

  let actions$: Observable<any>;
  let effects: LibraryEffects;
  let libraryService: jasmine.SpyObj<LibraryService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LoggerModule.forRoot()],
      providers: [
        LibraryEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            getComics: jasmine.createSpy('LibraryService.getComics()'),
            getUpdatesSince: jasmine.createSpy(
              'LibraryService.getUpdatesSince()'
            ),
            startRescan: jasmine.createSpy('LibraryService.startRescan()'),
            deleteMultipleComics: jasmine.createSpy(
              'LibraryService.deleteMultipleComics()'
            ),
            undeleteMultipleComics: jasmine.createSpy(
              'LibraryService.undeleteMultipleComics()'
            ),
            convertComics: jasmine.createSpy('LibraryService.convertComics()'),
            clearImageCache: jasmine.createSpy(
              'LibraryService.clearImageCache()'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(LibraryEffects);
    libraryService = TestBed.get(LibraryService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when getting library updates', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comics: COMICS,
        lastComicId: LAST_COMIC_ID,
        mostRecentUpdate: MOST_RECENT_UPDATE,
        moreUpdates: false,
        lastReadDates: LAST_READ_DATES,
        processingCount: 0,
        readingLists: []
      } as GetLibraryUpdateResponse;
      const action = new LibraryGetUpdates({
        lastUpdateDate: new Date(),
        timeout: 60,
        maximumComics: 100,
        processingCount: 29,
        lastComicId: 1010
      });
      const outcome = new LibraryUpdatesReceived({
        comics: COMICS,
        lastComicId: LAST_COMIC_ID,
        mostRecentUpdate: MOST_RECENT_UPDATE,
        lastReadDates: LAST_READ_DATES,
        processingCount: 0,
        moreUpdates: false,
        readingLists: []
      });

      actions$ = hot('-a', { a: action });
      libraryService.getUpdatesSince.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getUpdates$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new LibraryGetUpdates({
        lastUpdateDate: new Date(),
        timeout: 60,
        maximumComics: 100,
        processingCount: 29,
        lastComicId: 1010
      });
      const outcome = new LibraryGetUpdatesFailed();

      actions$ = hot('-a', { a: action });
      libraryService.getUpdatesSince.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.getUpdates$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryGetUpdates({
        lastUpdateDate: new Date(),
        timeout: 60,
        maximumComics: 100,
        processingCount: 29,
        lastComicId: 1010
      });
      const outcome = new LibraryGetUpdatesFailed();

      actions$ = hot('-a', { a: action });
      libraryService.getUpdatesSince.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getUpdates$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when starting a rescan', () => {
    it('fires an action on success', () => {
      const serviceResponse = { count: COUNT } as StartRescanResponse;
      const action = new LibraryStartRescan();
      const outcome = new LibraryRescanStarted({ count: COUNT });

      actions$ = hot('-a', { a: action });
      libraryService.startRescan.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.startRescan$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new LibraryStartRescan();
      const outcome = new LibraryStartRescanFailed();

      actions$ = hot('-a', { a: action });
      libraryService.startRescan.and.returnValue(throwError(serviceResponse));

      const expected = cold('-b', { b: outcome });
      expect(effects.startRescan$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryStartRescan();
      const outcome = new LibraryStartRescanFailed();

      actions$ = hot('-a', { a: action });
      libraryService.startRescan.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.startRescan$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when deleting multiple comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = { count: COUNT } as DeleteMultipleComicsResponse;
      const action = new LibraryDeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryMultipleComicsDeleted({
        count: COUNT
      });

      actions$ = hot('-a', { a: action });
      libraryService.deleteMultipleComics.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteMultipleComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new LibraryDeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryDeleteMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.deleteMultipleComics.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteMultipleComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryDeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryDeleteMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.deleteMultipleComics.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteMultipleComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when undeleting multiple comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        success: true
      } as UndeleteMultipleComicsResponse;
      const action = new LibraryUndeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryMultipleComicsUndeleted();

      actions$ = hot('-a', { a: action });
      libraryService.undeleteMultipleComics.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteMultipleComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new LibraryUndeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryUndeleteMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.undeleteMultipleComics.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteMultipleComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryUndeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryUndeleteMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.undeleteMultipleComics.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.undeleteMultipleComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('converting comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = new LibraryConvertComics({
        comics: COMICS,
        archiveType: 'CBZ',
        renamePages: true,
        deletePages: true,
        deleteOriginal: true
      });
      const outcome = new LibraryComicsConverting();

      actions$ = hot('-a', { a: action });
      libraryService.convertComics.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.convertComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new LibraryConvertComics({
        comics: COMICS,
        archiveType: 'CBZ',
        renamePages: true,
        deletePages: true,
        deleteOriginal: true
      });
      const outcome = new LibraryConvertComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.convertComics.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.convertComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryConvertComics({
        comics: COMICS,
        archiveType: 'CBZ',
        renamePages: true,
        deletePages: true,
        deleteOriginal: true
      });
      const outcome = new LibraryConvertComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.convertComics.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.convertComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('consolidating the library', () => {
    it('fires an action on successful clearing', () => {
      const serviceResponse = { success: true } as ClearImageCacheResponse;
      const action = new LibraryClearImageCache();
      const outcome = new LibraryImageCacheCleared();

      actions$ = hot('-a', { a: action });
      libraryService.clearImageCache.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearImageCache$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on failed clearing', () => {
      const serviceResponse = { success: false } as ClearImageCacheResponse;
      const action = new LibraryClearImageCache();
      const outcome = new LibraryClearImageCacheFailed();

      actions$ = hot('-a', { a: action });
      libraryService.clearImageCache.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearImageCache$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new LibraryClearImageCache();
      const outcome = new LibraryClearImageCacheFailed();

      actions$ = hot('-a', { a: action });
      libraryService.clearImageCache.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearImageCache$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryClearImageCache();
      const outcome = new LibraryClearImageCacheFailed();

      actions$ = hot('-a', { a: action });
      libraryService.clearImageCache.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearImageCache$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
