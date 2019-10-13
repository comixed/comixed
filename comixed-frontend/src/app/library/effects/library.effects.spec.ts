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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { LibraryEffects } from './library.effects';
import { LibraryService } from 'app/library/services/library.service';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5,
  SCAN_TYPE_7
} from 'app/comics/models/scan-type.fixtures';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { cold, hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FORMAT_1,
  FORMAT_3,
  FORMAT_5
} from 'app/comics/models/comic-format.fixtures';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/models/comic.fixtures';
import { generate_random_string } from '../../../test/testing-utils';
import { BlockedPageResponse } from 'app/library/models/net/blocked-page-response';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import objectContaining = jasmine.objectContaining;
import {
  LibraryBlockPageHash,
  LibraryBlockPageHashFailed,
  LibraryClearMetadata,
  LibraryClearMetadataFailed,
  LibraryComicUpdated,
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryGetFormats,
  LibraryGetFormatsFailed,
  LibraryGetScanTypes,
  LibraryGetScanTypesFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryFormatsReceived,
  LibraryGotScanTypes,
  LibraryUpdatesReceived,
  LibraryMetadataCleared,
  LibraryMultipleComicsDeleted,
  LibraryPageHashBlocked,
  LibraryRescanStarted,
  LibraryStartRescan,
  LibraryStartRescanFailed,
  LibraryUpdateComic,
  LibraryUpdateComicFailed
} from 'app/library/actions/library.actions';

describe('LibraryEffects', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5, SCAN_TYPE_7];
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];
  const COMIC = COMIC_1;
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const HASH = generate_random_string();

  let actions$: Observable<any>;
  let effects: LibraryEffects;
  let libraryService: jasmine.SpyObj<LibraryService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        LibraryEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            getScanTypes: jasmine.createSpy('LibraryService.getScanTypes'),
            getFormats: jasmine.createSpy('LibraryService.getFormats'),
            getUpdatesSince: jasmine.createSpy(
              'LibraryService.getUpdatesSince'
            ),
            startRescan: jasmine.createSpy('LibraryService.startRescan'),
            saveComic: jasmine.createSpy('LibraryService.saveComic'),
            clearComicMetadata: jasmine.createSpy(
              'LibraryService.clearComicMetadata'
            ),
            setPageHashBlockedState: jasmine.createSpy(
              'LibraryService.setPageHashBlockedState'
            ),
            deleteMultipleComics: jasmine.createSpy(
              'LibraryService.deleteMultipleComics'
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

  describe('when getting the set of scan types', () => {
    it('fires an action on success', () => {
      const service_response = SCAN_TYPES;
      const action = new LibraryGetScanTypes();
      const outcome = new LibraryGotScanTypes({
        scanTypes: SCAN_TYPES
      });

      actions$ = hot('-a', { a: action });
      libraryService.getScanTypes.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.getScanTypes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryGetScanTypes();
      const outcome = new LibraryGetScanTypesFailed();

      actions$ = hot('-a', { a: action });
      libraryService.getScanTypes.and.returnValue(throwError(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.getScanTypes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryGetScanTypes();
      const outcome = new LibraryGetScanTypesFailed();

      actions$ = hot('-a', { a: action });
      libraryService.getScanTypes.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.getScanTypes$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when getting the set of formats', () => {
    it('fires an action on success', () => {
      const service_response = FORMATS;
      const action = new LibraryGetFormats();
      const outcome = new LibraryFormatsReceived({
        formats: FORMATS
      });

      actions$ = hot('-a', { a: action });
      libraryService.getFormats.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.getFormats$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryGetFormats();
      const outcome = new LibraryGetFormatsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.getFormats.and.returnValue(throwError(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.getFormats$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryGetFormats();
      const outcome = new LibraryGetFormatsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.getFormats.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.getFormats$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when getting library updates', () => {
    it('fires an action on success', () => {
      const service_response = {
        comics: COMICS,
        lastReadDates: LAST_READ_DATES,
        processingCount: 0,
        rescanCount: 0
      } as GetLibraryUpdateResponse;
      const action = new LibraryGetUpdates({
        timestamp: 0,
        timeout: 60,
        maximumResults: 100
      });
      const outcome = new LibraryUpdatesReceived({
        comics: COMICS,
        lastReadDates: LAST_READ_DATES,
        processingCount: 0,
        rescanCount: 0
      });

      actions$ = hot('-a', { a: action });
      libraryService.getUpdatesSince.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.getUpdates$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryGetUpdates({
        timestamp: 0,
        timeout: 60,
        maximumResults: 100
      });
      const outcome = new LibraryGetUpdatesFailed();

      actions$ = hot('-a', { a: action });
      libraryService.getUpdatesSince.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.getUpdates$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryGetUpdates({
        timestamp: 0,
        timeout: 60,
        maximumResults: 100
      });
      const outcome = new LibraryGetUpdatesFailed();

      actions$ = hot('-a', { a: action });
      libraryService.getUpdatesSince.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.getUpdates$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when starting a rescan', () => {
    const COUNT = 17;

    it('fires an action on success', () => {
      const service_response = { count: COUNT } as StartRescanResponse;
      const action = new LibraryStartRescan();
      const outcome = new LibraryRescanStarted({ count: COUNT });

      actions$ = hot('-a', { a: action });
      libraryService.startRescan.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.startRescan$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryStartRescan();
      const outcome = new LibraryStartRescanFailed();

      actions$ = hot('-a', { a: action });
      libraryService.startRescan.and.returnValue(throwError(service_response));

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

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.startRescan$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when updating a comic', () => {
    it('fires an action on success', () => {
      const service_response = COMIC;
      const action = new LibraryUpdateComic({ comic: COMIC });
      const outcome = new LibraryComicUpdated({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      libraryService.saveComic.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.saveComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryUpdateComic({ comic: COMIC });
      const outcome = new LibraryUpdateComicFailed();

      actions$ = hot('-a', { a: action });
      libraryService.saveComic.and.returnValue(throwError(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.saveComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryUpdateComic({ comic: COMIC });
      const outcome = new LibraryUpdateComicFailed();

      actions$ = hot('-a', { a: action });
      libraryService.saveComic.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.saveComic$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when clearing the metadata for a comic', () => {
    it('fires an action on success', () => {
      const service_response = COMIC;
      const action = new LibraryClearMetadata({ comic: COMIC });
      const outcome = new LibraryMetadataCleared({
        comic: COMIC
      });

      actions$ = hot('-a', { a: action });
      libraryService.clearComicMetadata.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.clearComicMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryClearMetadata({ comic: COMIC });
      const outcome = new LibraryClearMetadataFailed();

      actions$ = hot('-a', { a: action });
      libraryService.clearComicMetadata.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.clearComicMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryClearMetadata({ comic: COMIC });
      const outcome = new LibraryClearMetadataFailed();

      actions$ = hot('-a', { a: action });
      libraryService.clearComicMetadata.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.clearComicMetadata$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when blocking a page hash', () => {
    it('fires an action on successful blocking', () => {
      const service_response = { hash: HASH, blocked: true };
      const action = new LibraryBlockPageHash({
        hash: HASH,
        blocked: true
      });
      const outcome = new LibraryPageHashBlocked({
        hash: HASH,
        blocked: true
      });

      actions$ = hot('-a', { a: action });
      libraryService.setPageHashBlockedState.and.returnValue(
        of(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.setPageHashBlockedState$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on successful unblocking', () => {
      const service_response = {
        hash: HASH,
        blocked: false
      } as BlockedPageResponse;
      const action = new LibraryBlockPageHash({
        hash: HASH,
        blocked: false
      });
      const outcome = new LibraryPageHashBlocked({
        hash: HASH,
        blocked: false
      });

      actions$ = hot('-a', { a: action });
      libraryService.setPageHashBlockedState.and.returnValue(
        of(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.setPageHashBlockedState$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryBlockPageHash({
        hash: HASH,
        blocked: false
      });
      const outcome = new LibraryBlockPageHashFailed();

      actions$ = hot('-a', { a: action });
      libraryService.setPageHashBlockedState.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.setPageHashBlockedState$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryBlockPageHash({
        hash: HASH,
        blocked: false
      });
      const outcome = new LibraryBlockPageHashFailed();

      actions$ = hot('-a', { a: action });
      libraryService.setPageHashBlockedState.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.setPageHashBlockedState$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when deleting multiple comics', () => {
    const COUNT = 5;

    it('fires an action on success', () => {
      const service_response = { count: COUNT } as DeleteMultipleComicsResponse;
      const action = new LibraryDeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryMultipleComicsDeleted({
        count: COUNT
      });

      actions$ = hot('-a', { a: action });
      libraryService.deleteMultipleComics.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.deleteMultipleComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryDeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryDeleteMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.deleteMultipleComics.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
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

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.deleteMultipleComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
