/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { RunLibraryPluginEffects } from './run-library-plugin.effects';
import { LibraryPluginService } from '@app/library-plugins/services/library-plugin.service';
import { LIBRARY_PLUGIN_4 } from '@app/library-plugins/library-plugins.fixtures';
import { COMIC_BOOK_2 } from '@app/comic-books/comic-books.fixtures';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  runLibraryPluginFailure,
  runLibraryPluginOnOneComicBook,
  runLibraryPluginOnSelectedComicBooks,
  runLibraryPluginSuccess
} from '@app/library-plugins/actions/run-library-plugin.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('RunLibraryPluginEffects', () => {
  const PLUGIN = LIBRARY_PLUGIN_4;
  const COMIC_BOOK = COMIC_BOOK_2;

  let actions$: Observable<any>;
  let effects: RunLibraryPluginEffects;
  let libraryPluginService: jasmine.SpyObj<LibraryPluginService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        RunLibraryPluginEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryPluginService,
          useValue: {
            runLibraryPluginOnOneComicBook: jasmine.createSpy(
              'LibraryPluginService.runLibraryPluginOnOneComicBook()'
            ),
            runLibraryPluginOnSelectedComicBooks: jasmine.createSpy(
              'LibraryPluginService.runLibraryPluginOnSelectedComicBooks()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(RunLibraryPluginEffects);
    libraryPluginService = TestBed.inject(
      LibraryPluginService
    ) as jasmine.SpyObj<LibraryPluginService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('running a plugin against once comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = runLibraryPluginOnOneComicBook({
        plugin: PLUGIN,
        comicBookId: COMIC_BOOK.id
      });
      const outcome = runLibraryPluginSuccess();

      actions$ = hot('-a', { a: action });
      libraryPluginService.runLibraryPluginOnOneComicBook
        .withArgs({
          plugin: PLUGIN,
          comicBookId: COMIC_BOOK.id
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.runLibraryPluginOnOneComicBook$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = runLibraryPluginOnOneComicBook({
        plugin: PLUGIN,
        comicBookId: COMIC_BOOK.id
      });
      const outcome = runLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      libraryPluginService.runLibraryPluginOnOneComicBook
        .withArgs({
          plugin: PLUGIN,
          comicBookId: COMIC_BOOK.id
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.runLibraryPluginOnOneComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = runLibraryPluginOnOneComicBook({
        plugin: PLUGIN,
        comicBookId: COMIC_BOOK.id
      });
      const outcome = runLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      libraryPluginService.runLibraryPluginOnOneComicBook
        .withArgs({
          plugin: PLUGIN,
          comicBookId: COMIC_BOOK.id
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.runLibraryPluginOnOneComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('running a plugin against selected comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = runLibraryPluginOnSelectedComicBooks({ plugin: PLUGIN });
      const outcome = runLibraryPluginSuccess();

      actions$ = hot('-a', { a: action });
      libraryPluginService.runLibraryPluginOnSelectedComicBooks
        .withArgs({ plugin: PLUGIN })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.runLibraryPluginOnSelectedComicBooks$).toBeObservable(
        expected
      );
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = runLibraryPluginOnSelectedComicBooks({ plugin: PLUGIN });
      const outcome = runLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      libraryPluginService.runLibraryPluginOnSelectedComicBooks
        .withArgs({ plugin: PLUGIN })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.runLibraryPluginOnSelectedComicBooks$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = runLibraryPluginOnSelectedComicBooks({ plugin: PLUGIN });
      const outcome = runLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      libraryPluginService.runLibraryPluginOnSelectedComicBooks
        .withArgs({ plugin: PLUGIN })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.runLibraryPluginOnSelectedComicBooks$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
