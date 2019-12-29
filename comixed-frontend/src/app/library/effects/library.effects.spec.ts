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

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { TranslateModule } from '@ngx-translate/core';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/models/comic.fixtures';
import {
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryMultipleComicsDeleted,
  LibraryRescanStarted,
  LibraryStartRescan,
  LibraryStartRescanFailed,
  LibraryUpdatesReceived
} from 'app/library/actions/library.actions';
import { COMIC_1_LAST_READ_DATE } from 'app/library/models/last-read-date.fixtures';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { LibraryService } from 'app/library/services/library.service';
import { cold, hot } from 'jasmine-marbles';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';
import { LibraryEffects } from './library.effects';
import objectContaining = jasmine.objectContaining;

describe('LibraryEffects', () => {
  const COMIC = COMIC_1;
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_COMIC_ID = 2716;
  const MOST_RECENT_UPDATE = new Date();
  const LAST_READ_DATES = [COMIC_1_LAST_READ_DATE];
  const LATEST_UPDATED_DATE = new Date();
  const COMIC_COUNT = 2814;
  const PAGE = 12;
  const COUNT = 25;
  const SORT_FIELD = 'addedDate';
  const ASCENDING = false;

  let actions$: Observable<any>;
  let effects: LibraryEffects;
  let libraryService: jasmine.SpyObj<LibraryService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LoggerTestingModule],
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
      const service_response = {
        comics: COMICS,
        lastComicId: LAST_COMIC_ID,
        mostRecentUpdate: MOST_RECENT_UPDATE,
        moreUpdates: false,
        lastReadDates: LAST_READ_DATES,
        processingCount: 0
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
        moreUpdates: false
      });

      actions$ = hot('-a', { a: action });
      libraryService.getUpdatesSince.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.getUpdates$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
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
        lastUpdateDate: new Date(),
        timeout: 60,
        maximumComics: 100,
        processingCount: 29,
        lastComicId: 1010
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

  describe('when deleting multiple comics', () => {
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
