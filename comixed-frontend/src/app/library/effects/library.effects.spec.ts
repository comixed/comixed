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
import * as LibraryActions from 'app/library/actions/library.actions';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { cold, hot } from 'jasmine-marbles';
import objectContaining = jasmine.objectContaining;
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
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
import { LibraryUpdateResponse } from 'app/library/models/net/library-update-response';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';

describe('LibraryEffects', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5, SCAN_TYPE_7];
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];
  const COMIC = COMIC_1;
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const HASH = generate_random_string();

  let actions$: Observable<any>;
  let effects: LibraryEffects;
  let library_service: jasmine.SpyObj<LibraryService>;
  let message_service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        LibraryEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            get_scan_types: jasmine.createSpy('LibraryService.get_scan_types'),
            get_formats: jasmine.createSpy('LibraryService.get_formats'),
            get_updates: jasmine.createSpy('LibraryService.get_updates'),
            start_rescan: jasmine.createSpy('LibraryService.start_rescan'),
            update_comic: jasmine.createSpy('LibraryService.update_comic'),
            clear_metadata: jasmine.createSpy('LibraryService.clear_metadata'),
            set_block_page_hash: jasmine.createSpy(
              'LibraryService.set_block_page_hash'
            ),
            delete_multiple_comics: jasmine.createSpy(
              'LibraryService.delete_multiple_comics'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(LibraryEffects);
    library_service = TestBed.get(LibraryService);
    message_service = TestBed.get(MessageService);
    spyOn(message_service, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when getting the set of scan types', () => {
    it('fires an action on success', () => {
      const service_response = SCAN_TYPES;
      const action = new LibraryActions.LibraryGetScanTypes();
      const outcome = new LibraryActions.LibraryGotScanTypes({
        scan_types: SCAN_TYPES
      });

      actions$ = hot('-a', { a: action });
      library_service.get_scan_types.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.get_scan_types$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryActions.LibraryGetScanTypes();
      const outcome = new LibraryActions.LibraryGetScanTypesFailed();

      actions$ = hot('-a', { a: action });
      library_service.get_scan_types.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.get_scan_types$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryActions.LibraryGetScanTypes();
      const outcome = new LibraryActions.LibraryGetScanTypesFailed();

      actions$ = hot('-a', { a: action });
      library_service.get_scan_types.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.get_scan_types$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when getting the set of formats', () => {
    it('fires an action on success', () => {
      const service_response = FORMATS;
      const action = new LibraryActions.LibraryGetFormats();
      const outcome = new LibraryActions.LibraryGotFormats({
        formats: FORMATS
      });

      actions$ = hot('-a', { a: action });
      library_service.get_formats.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.get_formats$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryActions.LibraryGetFormats();
      const outcome = new LibraryActions.LibraryGetFormatsFailed();

      actions$ = hot('-a', { a: action });
      library_service.get_formats.and.returnValue(throwError(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.get_formats$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryActions.LibraryGetFormats();
      const outcome = new LibraryActions.LibraryGetFormatsFailed();

      actions$ = hot('-a', { a: action });
      library_service.get_formats.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.get_formats$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when getting library updates', () => {
    it('fires an action on success', () => {
      const service_response = {
        comics: COMICS,
        last_read_dates: LAST_READ_DATES,
        pending_imports: 0,
        pending_rescans: 0
      } as LibraryUpdateResponse;
      const action = new LibraryActions.LibraryGetUpdates({
        later_than: 0,
        timeout: 60,
        maximum: 100
      });
      const outcome = new LibraryActions.LibraryGotUpdates({
        comics: COMICS,
        last_read_dates: LAST_READ_DATES,
        pending_imports: 0,
        pending_rescans: 0
      });

      actions$ = hot('-a', { a: action });
      library_service.get_updates.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.get_updates$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryActions.LibraryGetUpdates({
        later_than: 0,
        timeout: 60,
        maximum: 100
      });
      const outcome = new LibraryActions.LibraryGetUpdatesFailed();

      actions$ = hot('-a', { a: action });
      library_service.get_updates.and.returnValue(throwError(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.get_updates$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryActions.LibraryGetUpdates({
        later_than: 0,
        timeout: 60,
        maximum: 100
      });
      const outcome = new LibraryActions.LibraryGetUpdatesFailed();

      actions$ = hot('-a', { a: action });
      library_service.get_updates.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.get_updates$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when starting a rescan', () => {
    const COUNT = 17;

    it('fires an action on success', () => {
      const service_response = { count: COUNT } as StartRescanResponse;
      const action = new LibraryActions.LibraryStartRescan();
      const outcome = new LibraryActions.LibraryRescanStarted({ count: COUNT });

      actions$ = hot('-a', { a: action });
      library_service.start_rescan.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.start_rescan$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryActions.LibraryStartRescan();
      const outcome = new LibraryActions.LibraryStartRescanFailed();

      actions$ = hot('-a', { a: action });
      library_service.start_rescan.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.start_rescan$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryActions.LibraryStartRescan();
      const outcome = new LibraryActions.LibraryStartRescanFailed();

      actions$ = hot('-a', { a: action });
      library_service.start_rescan.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.start_rescan$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when updating a comic', () => {
    it('fires an action on success', () => {
      const service_response = COMIC;
      const action = new LibraryActions.LibraryUpdateComic({ comic: COMIC });
      const outcome = new LibraryActions.LibraryComicUpdated({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      library_service.update_comic.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.update_comic$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryActions.LibraryUpdateComic({ comic: COMIC });
      const outcome = new LibraryActions.LibraryUpdateComicFailed();

      actions$ = hot('-a', { a: action });
      library_service.update_comic.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.update_comic$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryActions.LibraryUpdateComic({ comic: COMIC });
      const outcome = new LibraryActions.LibraryUpdateComicFailed();

      actions$ = hot('-a', { a: action });
      library_service.update_comic.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.update_comic$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when clearing the metadata for a comic', () => {
    it('fires an action on success', () => {
      const service_response = COMIC;
      const action = new LibraryActions.LibraryClearMetadata({ comic: COMIC });
      const outcome = new LibraryActions.LibraryMetadataCleared({
        comic: COMIC
      });

      actions$ = hot('-a', { a: action });
      library_service.clear_metadata.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.clear_metadata$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryActions.LibraryClearMetadata({ comic: COMIC });
      const outcome = new LibraryActions.LibraryClearMetadataFailed();

      actions$ = hot('-a', { a: action });
      library_service.clear_metadata.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.clear_metadata$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryActions.LibraryClearMetadata({ comic: COMIC });
      const outcome = new LibraryActions.LibraryClearMetadataFailed();

      actions$ = hot('-a', { a: action });
      library_service.clear_metadata.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.clear_metadata$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when blocking a page hash', () => {
    it('fires an action on successful blocking', () => {
      const service_response = { hash: HASH, blocked: true };
      const action = new LibraryActions.LibraryBlockPageHash({
        hash: HASH,
        blocked: true
      });
      const outcome = new LibraryActions.LibraryPageHashBlocked({
        hash: HASH,
        blocked: true
      });

      actions$ = hot('-a', { a: action });
      library_service.set_block_page_hash.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.block_page_hash$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on successful unblocking', () => {
      const service_response = {
        hash: HASH,
        blocked: false
      } as BlockedPageResponse;
      const action = new LibraryActions.LibraryBlockPageHash({
        hash: HASH,
        blocked: false
      });
      const outcome = new LibraryActions.LibraryPageHashBlocked({
        hash: HASH,
        blocked: false
      });

      actions$ = hot('-a', { a: action });
      library_service.set_block_page_hash.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.block_page_hash$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryActions.LibraryBlockPageHash({
        hash: HASH,
        blocked: false
      });
      const outcome = new LibraryActions.LibraryBlockPageHashFailed();

      actions$ = hot('-a', { a: action });
      library_service.set_block_page_hash.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.block_page_hash$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryActions.LibraryBlockPageHash({
        hash: HASH,
        blocked: false
      });
      const outcome = new LibraryActions.LibraryBlockPageHashFailed();

      actions$ = hot('-a', { a: action });
      library_service.set_block_page_hash.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.block_page_hash$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when deleting multiple comics', () => {
    const COUNT = 5;

    it('fires an action on success', () => {
      const service_response = { count: COUNT } as DeleteMultipleComicsResponse;
      const action = new LibraryActions.LibraryDeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryActions.LibraryMultipleComicsDeleted({
        count: COUNT
      });

      actions$ = hot('-a', { a: action });
      library_service.delete_multiple_comics.and.returnValue(
        of(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.delete_multiple_comics$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new LibraryActions.LibraryDeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryActions.LibraryDeleteMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      library_service.delete_multiple_comics.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.delete_multiple_comics$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new LibraryActions.LibraryDeleteMultipleComics({
        ids: [7, 17, 65]
      });
      const outcome = new LibraryActions.LibraryDeleteMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      library_service.delete_multiple_comics.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.delete_multiple_comics$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
