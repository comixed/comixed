/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { FindComicFilesEffects } from './find-comic-files.effects';
import { ComicImportService } from 'app/comic-import/services/comic-import.service';
import { CoreModule } from 'app/core/core.module';
import { AlertService, ApiResponse } from 'app/core';
import { MessageService } from 'primeng/api';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/comic-import/models/comic-file.fixtures';
import {
  comicFilesFound,
  findComicFiles,
  findComicFilesFailed
} from 'app/comic-import/actions/find-comic-files.actions';
import { hot } from 'jasmine-marbles';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';

describe('FindComicFilesEffects', () => {
  const DIRECTORY = '/Users/comixedreader/Documents/comics';
  const MAXIMUM = 17;
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let actions$: Observable<any>;
  let effects: FindComicFilesEffects;
  let comicImportService: jasmine.SpyObj<ComicImportService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        FindComicFilesEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicImportService,
          useValue: {
            getFiles: jasmine.createSpy('ComicImportService.getFiles()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<FindComicFilesEffects>(FindComicFilesEffects);
    comicImportService = TestBed.get(ComicImportService) as jasmine.SpyObj<
      ComicImportService
    >;
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('finding comic files', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        success: true,
        result: COMIC_FILES
      } as ApiResponse<ComicFile[]>;
      const action = findComicFiles({ directory: DIRECTORY, maximum: MAXIMUM });
      const outcome = comicFilesFound({ comicFiles: COMIC_FILES });

      actions$ = hot('-a', { a: action });
      comicImportService.getFiles.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.findComicFiles$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<ComicFile[]>;
      const action = findComicFiles({ directory: DIRECTORY, maximum: MAXIMUM });
      const outcome = findComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.getFiles.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.findComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = findComicFiles({ directory: DIRECTORY, maximum: MAXIMUM });
      const outcome = findComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.getFiles.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.findComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = findComicFiles({ directory: DIRECTORY, maximum: MAXIMUM });
      const outcome = findComicFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.getFiles.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.findComicFiles$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
