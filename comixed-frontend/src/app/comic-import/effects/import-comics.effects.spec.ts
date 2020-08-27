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

import { ImportComicsEffects } from './import-comics.effects';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/comic-import/models/comic-file.fixtures';
import { ComicImportService } from 'app/comic-import/services/comic-import.service';
import { AlertService, ApiResponse } from 'app/core';
import { CoreModule } from 'app/core/core.module';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import {
  comicsImporting,
  importComics,
  importComicsFailed
} from 'app/comic-import/actions/import-comics.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('ImportComicsEffects', () => {
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let actions$: Observable<any>;
  let effects: ImportComicsEffects;
  let comicImportService: jasmine.SpyObj<ComicImportService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ImportComicsEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicImportService,
          useValue: {
            startImport: jasmine.createSpy('ComicImportService.startImport()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<ImportComicsEffects>(ImportComicsEffects);
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

  describe('importing comic files', () => {
    it('fires an action on success', () => {
      const serviceResponse = { success: true } as ApiResponse<void>;
      const action = importComics({
        files: COMIC_FILES,
        ignoreMetadata: true,
        deleteBlockedPages: true
      });
      const outcome = comicsImporting();

      actions$ = hot('-a', { a: action });
      comicImportService.startImport.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.importComics$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<void>;
      const action = importComics({
        files: COMIC_FILES,
        ignoreMetadata: true,
        deleteBlockedPages: true
      });
      const outcome = importComicsFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.startImport.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.importComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = importComics({
        files: COMIC_FILES,
        ignoreMetadata: true,
        deleteBlockedPages: true
      });
      const outcome = importComicsFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.startImport.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.importComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = importComics({
        files: COMIC_FILES,
        ignoreMetadata: true,
        deleteBlockedPages: true
      });
      const outcome = importComicsFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.startImport.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.importComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
