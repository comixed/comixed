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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ImportEffects } from './import.effects';
import { ImportService } from 'app/library/services/import.service';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/library/models/comic-file.fixtures';
import { cold, hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import objectContaining = jasmine.objectContaining;
import {
  ImportFilesReceived,
  ImportGetFiles,
  ImportGetFilesFailed,
  ImportStarted,
  ImportStart,
  ImportFailedToStart
} from 'app/library/actions/import.actions';
import { ImportComicFilesResponse } from 'app/library/models/net/import-comic-files-response';

describe('ImportEffects', () => {
  const DIRECTORY = '/Users/comixed/Documents/comics';
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let actions$: Observable<any>;
  let effects: ImportEffects;
  let import_service: jasmine.SpyObj<ImportService>;
  let message_service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        ImportEffects,
        provideMockActions(() => actions$),
        {
          provide: ImportService,
          useValue: {
            get_comic_files: jasmine.createSpy('ImportService.get_comic_files'),
            import_comic_files: jasmine.createSpy(
              'ImportService.import_comic_files'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(ImportEffects);
    import_service = TestBed.get(ImportService);
    message_service = TestBed.get(MessageService);
    spyOn(message_service, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when getting comics files in a directory', () => {
    it('fires an action on success', () => {
      const service_response = COMIC_FILES;
      const action = new ImportGetFiles({ directory: DIRECTORY });
      const outcome = new ImportFilesReceived({
        comic_files: COMIC_FILES
      });

      actions$ = hot('-a', { a: action });
      import_service.get_comic_files.and.returnValue(of(COMIC_FILES));

      const expected = cold('-b', { b: outcome });
      expect(effects.get_comic_files$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ImportGetFiles({ directory: DIRECTORY });
      const outcome = new ImportGetFilesFailed();

      actions$ = hot('-a', { a: action });
      import_service.get_comic_files.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.get_comic_files$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ImportGetFiles({ directory: DIRECTORY });
      const outcome = new ImportGetFilesFailed();

      actions$ = hot('-a', { a: action });
      import_service.get_comic_files.and.throwError('expected');

      const expected = cold('-(b|) ', { b: outcome });
      expect(effects.get_comic_files$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when starting to import comics files', () => {
    it('fires an action on success', () => {
      const service_response = {
        import_comic_count: 17
      } as ImportComicFilesResponse;
      const action = new ImportStart({
        comic_files: COMIC_FILES,
        delete_blocked_pages: true,
        ignore_metadata: false
      });
      const outcome = new ImportStarted({ import_comic_count: 17 });

      actions$ = hot('-a', { a: action });
      import_service.import_comic_files.and.returnValue(of(service_response));

      const expected = cold('-b', { b: outcome });
      expect(effects.import_comic_files$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ImportStart({
        comic_files: COMIC_FILES,
        delete_blocked_pages: true,
        ignore_metadata: false
      });
      const outcome = new ImportFailedToStart();

      actions$ = hot('-a', { a: action });
      import_service.import_comic_files.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.import_comic_files$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ImportStart({
        comic_files: COMIC_FILES,
        delete_blocked_pages: true,
        ignore_metadata: false
      });
      const outcome = new ImportFailedToStart();

      actions$ = hot('-a', { a: action });
      import_service.import_comic_files.and.throwError('expected');

      const expected = cold('-(b|) ', { b: outcome });
      expect(effects.import_comic_files$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
