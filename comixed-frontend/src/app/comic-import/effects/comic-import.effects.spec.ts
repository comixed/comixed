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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  ComicImportFilesReceived,
  ComicImportGetFiles,
  ComicImportGetFilesFailed,
  ComicImportStart,
  ComicImportStarted,
  ComicImportStartFailed
} from 'app/comic-import/actions/comic-import.actions';
import {
  COMIC_FILE_1,
  COMIC_FILE_3
} from 'app/comic-import/models/comic-file.fixtures';
import { ComicImportService } from 'app/comic-import/services/comic-import.service';
import { hot } from 'jasmine-marbles';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';

import { ComicImportEffects } from './comic-import.effects';
import { LoggerModule } from '@angular-ru/logger';
import objectContaining = jasmine.objectContaining;

describe('ComicImportEffects', () => {
  const DIRECTORY = '/Users/comixedreader/Library';
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_3];
  const MAXIMUM = 23;

  let actions$: Observable<any>;
  let effects: ComicImportEffects;
  let comicImportService: jasmine.SpyObj<ComicImportService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LoggerModule.forRoot()],
      providers: [
        ComicImportEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicImportService,
          useValue: {
            getFiles: jasmine.createSpy('ComicImportService.getAll()'),
            startImport: jasmine.createSpy('ComicImportService.startImport')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(ComicImportEffects);
    comicImportService = TestBed.get(ComicImportService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting comic files', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC_FILES;
      const action = new ComicImportGetFiles({
        directory: DIRECTORY,
        maximum: MAXIMUM
      });
      const outcome = new ComicImportFilesReceived({ comicFiles: COMIC_FILES });

      actions$ = hot('-a', { a: action });
      comicImportService.getFiles.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getFiles$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicImportGetFiles({
        directory: DIRECTORY,
        maximum: MAXIMUM
      });
      const outcome = new ComicImportGetFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.getFiles.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getFiles$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicImportGetFiles({
        directory: DIRECTORY,
        maximum: MAXIMUM
      });
      const outcome = new ComicImportGetFilesFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.getFiles.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getFiles$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('import comic files', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = new ComicImportStart({
        comicFiles: COMIC_FILES,
        ignoreMetadata: false,
        deleteBlockedPages: true
      });
      const outcome = new ComicImportStarted();

      actions$ = hot('-a', { a: action });
      comicImportService.startImport.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.startImport$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ComicImportStart({
        comicFiles: COMIC_FILES,
        ignoreMetadata: false,
        deleteBlockedPages: true
      });
      const outcome = new ComicImportStartFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.startImport.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.startImport$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ComicImportStart({
        comicFiles: COMIC_FILES,
        ignoreMetadata: false,
        deleteBlockedPages: true
      });
      const outcome = new ComicImportStartFailed();

      actions$ = hot('-a', { a: action });
      comicImportService.startImport.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.startImport$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
