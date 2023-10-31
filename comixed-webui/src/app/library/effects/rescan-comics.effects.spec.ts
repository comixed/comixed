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
import { RescanComicsEffects } from './rescan-comics.effects';
import { LibraryService } from '@app/library/services/library.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertService } from '@app/core/services/alert.service';
import { COMIC_DETAIL_1 } from '@app/comic-books/comic-books.fixtures';
import {
  rescanComicBooksFailure,
  rescanComicBooksSuccess,
  rescanSelectedComicBooks,
  rescanSingleComicBook
} from '@app/library/actions/rescan-comics.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

describe('RescanComicsEffects', () => {
  const COMIC_DETAIL = COMIC_DETAIL_1;

  let actions$: Observable<any>;
  let effects: RescanComicsEffects;
  let libraryService: jasmine.SpyObj<LibraryService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        RescanComicsEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            rescanSingleComicBook: jasmine.createSpy(
              'LibraryService.rescanSingleComicBook()'
            ),
            rescanSelectedComicBooks: jasmine.createSpy(
              'LibraryService.rescanSelectedComicBooks()'
            )
          }
        }
      ]
    });

    effects = TestBed.inject(RescanComicsEffects);
    libraryService = TestBed.inject(
      LibraryService
    ) as jasmine.SpyObj<LibraryService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('rescanning a single comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = rescanSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = rescanComicBooksSuccess();

      actions$ = hot('-a', { a: action });
      libraryService.rescanSingleComicBook
        .withArgs({ comicBookId: COMIC_DETAIL.comicId })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.rescanSingleComicBook$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = rescanSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = rescanComicBooksFailure();

      actions$ = hot('-a', { a: action });
      libraryService.rescanSingleComicBook
        .withArgs({ comicBookId: COMIC_DETAIL.comicId })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.rescanSingleComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = rescanSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = rescanComicBooksFailure();

      actions$ = hot('-a', { a: action });
      libraryService.rescanSingleComicBook
        .withArgs({ comicBookId: COMIC_DETAIL.comicId })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.rescanSingleComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('rescanning selected comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = rescanSelectedComicBooks();
      const outcome = rescanComicBooksSuccess();

      actions$ = hot('-a', { a: action });
      libraryService.rescanSelectedComicBooks
        .withArgs()
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.rescanSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = rescanSelectedComicBooks();
      const outcome = rescanComicBooksFailure();

      actions$ = hot('-a', { a: action });
      libraryService.rescanSelectedComicBooks
        .withArgs()
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.rescanSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = rescanSelectedComicBooks();
      const outcome = rescanComicBooksFailure();

      actions$ = hot('-a', { a: action });
      libraryService.rescanSelectedComicBooks
        .withArgs()
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.rescanSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
