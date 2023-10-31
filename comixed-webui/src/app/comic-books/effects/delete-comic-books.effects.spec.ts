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
import { ComicBookService } from '@app/comic-books/services/comic-book.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { COMIC_DETAIL_1 } from '@app/comic-books/comic-books.fixtures';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  deleteComicBooksFailure,
  deleteComicBooksSuccess,
  deleteSelectedComicBooks,
  deleteSingleComicBook,
  undeleteSelectedComicBooks,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import { hot } from 'jasmine-marbles';
import { DeleteComicBooksEffects } from '@app/comic-books/effects/delete-comic-books.effects';

describe('DeleteComicBooksEffects', () => {
  const COMIC_DETAIL = COMIC_DETAIL_1;

  let actions$: Observable<any>;
  let effects: DeleteComicBooksEffects;
  let comicService: jasmine.SpyObj<ComicBookService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        DeleteComicBooksEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicBookService,
          useValue: {
            deleteSingleComicBook: jasmine.createSpy(
              'ComicBookService.deleteSingleComicBook()'
            ),
            undeleteSingleComicBook: jasmine.createSpy(
              'ComicBookService.undeleteSingleComicBook()'
            ),
            deleteSelectedComicBooks: jasmine.createSpy(
              'ComicBookService.deleteSelectedComicBooks()'
            ),
            undeleteSelectedComicBooks: jasmine.createSpy(
              'ComicBookService.undeleteSelectedComicBooks()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(DeleteComicBooksEffects);
    comicService = TestBed.inject(
      ComicBookService
    ) as jasmine.SpyObj<ComicBookService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('deleting a single comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = deleteSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = deleteComicBooksSuccess();

      actions$ = hot('-a', { a: action });
      comicService.deleteSingleComicBook.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteSingleComicBook$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = deleteComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicService.deleteSingleComicBook.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteSingleComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = deleteComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicService.deleteSingleComicBook.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteSingleComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('undeleting a single comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = undeleteSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = deleteComicBooksSuccess();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSingleComicBook
        .withArgs({ comicBookId: COMIC_DETAIL.comicId })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteSingleComicBook$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = undeleteSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = deleteComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSingleComicBook
        .withArgs({ comicBookId: COMIC_DETAIL.comicId })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteSingleComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = undeleteSingleComicBook({
        comicBookId: COMIC_DETAIL.comicId
      });
      const outcome = deleteComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSingleComicBook
        .withArgs({ comicBookId: COMIC_DETAIL.comicId })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.undeleteSingleComicBook$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('deleting the selected comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = deleteSelectedComicBooks();
      const outcome = deleteComicBooksSuccess();

      actions$ = hot('-a', { a: action });
      comicService.deleteSelectedComicBooks
        .withArgs()
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteSelectedComicBooks();
      const outcome = deleteComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicService.deleteSelectedComicBooks
        .withArgs()
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteSelectedComicBooks();
      const outcome = deleteComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicService.deleteSelectedComicBooks
        .withArgs()
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('undeleting the selected comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = undeleteSelectedComicBooks();
      const outcome = deleteComicBooksSuccess();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSelectedComicBooks
        .withArgs()
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = undeleteSelectedComicBooks();
      const outcome = deleteComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSelectedComicBooks
        .withArgs()
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = undeleteSelectedComicBooks();
      const outcome = deleteComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSelectedComicBooks
        .withArgs()
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.undeleteSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
