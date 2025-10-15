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
  ROOT_DIRECTORY
} from '@app/comic-files/comic-file.fixtures';
import { ComicImportService } from '@app/comic-files/services/comic-import.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadComicFilesResponse } from '@app/library/models/net/load-comic-files-response';
import {
  loadComicFileListFailure,
  loadComicFileLists,
  loadComicFileListSuccess,
  loadComicFilesFromSession,
  toggleComicFileSelections,
  toggleComicFileSelectionsFailure,
  toggleComicFileSelectionsSuccess
} from '@app/comic-files/actions/comic-file-list.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/library/library.constants';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';

describe('ComicFileListEffects', () => {
  const GROUPS: ComicFileGroup[] = [
    {
      directory: 'directory1',
      files: [COMIC_FILE_1, COMIC_FILE_3]
    },
    {
      directory: 'directory2',
      files: [COMIC_FILE_2]
    }
  ];
  const FILENAME = COMIC_FILE_1.filename;
  const SELECTED = Math.random() > 0.5;

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
            loadComicFilesFromSession: jasmine.createSpy(
              'ComicFileService.loadComicFilesFromSession()'
            ),
            loadComicFiles: jasmine.createSpy(
              'ComicFileService.loadComicFiles()'
            ),
            toggleComicFileSelections: jasmine.createSpy(
              'ComicFileService.toggleComicFileSelections()'
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

  describe('loading the comic files from the user session', () => {
    it('fires an action on success', () => {
      const serviceResponse = { groups: GROUPS } as LoadComicFilesResponse;
      const action = loadComicFilesFromSession();
      const outcome = loadComicFileListSuccess({ groups: GROUPS });

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFilesFromSession.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicFilesFromSession$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicFilesFromSession();
      const outcome = loadComicFileListFailure();

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFilesFromSession.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicFilesFromSession$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicFilesFromSession();
      const outcome = loadComicFileListFailure();

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFilesFromSession.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicFilesFromSession$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading comic files', () => {
    const MAXIMUM_RESULT = 100;

    it('fires an action on success', () => {
      const serviceResponse = { groups: GROUPS } as LoadComicFilesResponse;
      const action = loadComicFileLists({
        directory: ROOT_DIRECTORY,
        maximum: MAXIMUM_RESULT
      });
      const outcome1 = loadComicFileListSuccess({ groups: GROUPS });
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
      const action = loadComicFileLists({
        directory: ROOT_DIRECTORY,
        maximum: 100
      });
      const outcome = loadComicFileListFailure();

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFiles.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicFileLists({
        directory: ROOT_DIRECTORY,
        maximum: 100
      });
      const outcome = loadComicFileListFailure();

      actions$ = hot('-a', { a: action });
      comicImportService.loadComicFiles.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('toggling comic file selections', () => {
    it('fires an action on success', () => {
      const serviceResponse = { groups: GROUPS } as LoadComicFilesResponse;
      const action = toggleComicFileSelections({
        filename: FILENAME,
        selected: SELECTED
      });
      const outcome = toggleComicFileSelectionsSuccess({ groups: GROUPS });

      actions$ = hot('-a', { a: action });
      comicImportService.toggleComicFileSelections
        .withArgs({
          filename: FILENAME,
          selected: SELECTED
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.toggleComicFileSelections$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = toggleComicFileSelections({
        filename: FILENAME,
        selected: SELECTED
      });
      const outcome = toggleComicFileSelectionsFailure();

      actions$ = hot('-a', { a: action });
      comicImportService.toggleComicFileSelections
        .withArgs({
          filename: FILENAME,
          selected: SELECTED
        })
        .and.returnValue(throwError(() => serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.toggleComicFileSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = toggleComicFileSelections({
        filename: FILENAME,
        selected: SELECTED
      });
      const outcome = toggleComicFileSelectionsFailure();

      actions$ = hot('-a', { a: action });
      comicImportService.toggleComicFileSelections
        .withArgs({
          filename: FILENAME,
          selected: SELECTED
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.toggleComicFileSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
