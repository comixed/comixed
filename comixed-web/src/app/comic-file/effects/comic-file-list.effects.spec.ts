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

import { ComicFileListEffects } from './comic-file-list.effects';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4,
  ROOT_DIRECTORY
} from '@app/comic-file/comic-file.fixtures';
import { ComicImportService } from '@app/comic-file/services/comic-import.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadComicFilesResponse } from '@app/library/models/net/load-comic-files-response';
import {
  comicFilesLoaded,
  loadComicFiles,
  loadComicFilesFailed
} from '@app/comic-file/actions/comic-file-list.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/library/library.constants';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('ComicFileListEffects', () => {
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let actions$: Observable<any>;
  let effects: ComicFileListEffects;
  let comicImportService: jasmine.SpyObj<ComicImportService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ComicFileListEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicImportService,
          useValue: {
            loadComicFiles: jasmine.createSpy(
              'ComicFileService.loadComicFiles()'
            ),
            sendComicFiles: jasmine.createSpy(
              'ComicFileService.sendComicFiles()'
            )
          }
        }
      ]
    });

    effects = TestBed.inject(ComicFileListEffects);
    comicImportService = TestBed.inject(
      ComicImportService
    ) as jasmine.SpyObj<ComicImportService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading comic files', () => {
    const MAXIMUM_RESULT = 100;

    it('fires an action on success', () => {
      const serviceResponse = { files: FILES } as LoadComicFilesResponse;
      const action = loadComicFiles({
        directory: ROOT_DIRECTORY,
        maximum: MAXIMUM_RESULT
      });
      const outcome1 = comicFilesLoaded({ files: FILES });
      const outcome2 = saveUserPreference({
        name: IMPORT_ROOT_DIRECTORY_PREFERENCE,
        value: ROOT_DIRECTORY
      });
      const outcome3 = saveUserPreference({
        name: IMPORT_MAXIMUM_RESULTS_PREFERENCE,
        value: `${MAXIMUM_RESULT}`
      });

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFiles.and.returnValue(of(serviceResponse));

      const expected = hot('-(bcd)', { b: outcome1, c: outcome2, d: outcome3 });
      expect(effects.loadComicFiles$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicFiles({
        directory: ROOT_DIRECTORY,
        maximum: 100
      });
      const outcome = loadComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFiles.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicFiles({
        directory: ROOT_DIRECTORY,
        maximum: 100
      });
      const outcome = loadComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFiles.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
