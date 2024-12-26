/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { ReadComicBooksEffects } from './read-comic-books-effects.service';
import {
  markSelectedComicBooksRead,
  markSelectedComicBooksReadFailed,
  markSelectedComicBooksReadSuccess,
  markSingleComicBookRead
} from '@app/user/actions/read-comic-books.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AlertService } from '@app/core/services/alert.service';
import { ReadComicBooksService } from '@app/user/services/read-comic-books.service';
import {
  READ_COMIC_BOOK_1,
  READ_COMIC_BOOK_2,
  READ_COMIC_BOOK_3,
  READ_COMIC_BOOK_4,
  READ_COMIC_BOOK_5
} from '@app/user/user.fixtures';
import { COMIC_DETAIL_4 } from '@app/comic-books/comic-books.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';

describe('ReadComicBooksEffects', () => {
  const READ = Math.random() > 0.5;
  const READ_COUNT = 129;
  const UNREAD_COUNT = 717;
  const ENTRIES = [
    READ_COMIC_BOOK_1,
    READ_COMIC_BOOK_2,
    READ_COMIC_BOOK_3,
    READ_COMIC_BOOK_4,
    READ_COMIC_BOOK_5
  ];
  const COMIC_DETAIL = COMIC_DETAIL_4;

  let actions$: Observable<any>;
  let effects: ReadComicBooksEffects;
  let readComicBooksService: jasmine.SpyObj<ReadComicBooksService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ReadComicBooksEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadComicBooksService,
          useValue: {
            setSingleReadState: jasmine.createSpy(
              'ReadComicBooksService.setSingleReadState()'
            ),
            setSelectedReadState: jasmine.createSpy(
              'ReadComicBooksService.setSelectedReadState()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ReadComicBooksEffects);
    readComicBooksService = TestBed.inject(
      ReadComicBooksService
    ) as jasmine.SpyObj<ReadComicBooksService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('updating the read state of a single comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = markSingleComicBookRead({
        comicBookId: COMIC_DETAIL.comicId,
        read: READ
      });
      const outcome = markSelectedComicBooksReadSuccess();

      actions$ = hot('-a', { a: action });
      readComicBooksService.setSingleReadState
        .withArgs({ comicBookId: COMIC_DETAIL.comicId, read: READ })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSingleComicBookReadState$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = markSingleComicBookRead({
        comicBookId: COMIC_DETAIL.comicId,
        read: READ
      });
      const outcome = markSelectedComicBooksReadFailed();

      actions$ = hot('-a', { a: action });
      readComicBooksService.setSingleReadState
        .withArgs({ comicBookId: COMIC_DETAIL.comicId, read: READ })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSingleComicBookReadState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = markSingleComicBookRead({
        comicBookId: COMIC_DETAIL.comicId,
        read: READ
      });
      const outcome = markSelectedComicBooksReadFailed();

      actions$ = hot('-a', { a: action });
      readComicBooksService.setSingleReadState
        .withArgs({ comicBookId: COMIC_DETAIL.comicId, read: READ })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSingleComicBookReadState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('updating the read state of selected comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = markSelectedComicBooksRead({
        read: READ
      });
      const outcome = markSelectedComicBooksReadSuccess();

      actions$ = hot('-a', { a: action });
      readComicBooksService.setSelectedReadState
        .withArgs({ read: READ })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedComicBooksReadState$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = markSelectedComicBooksRead({
        read: READ
      });
      const outcome = markSelectedComicBooksReadFailed();

      actions$ = hot('-a', { a: action });
      readComicBooksService.setSelectedReadState
        .withArgs({ read: READ })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedComicBooksReadState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = markSelectedComicBooksRead({
        read: READ
      });
      const outcome = markSelectedComicBooksReadFailed();

      actions$ = hot('-a', { a: action });
      readComicBooksService.setSelectedReadState
        .withArgs({ read: READ })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSelectedComicBooksReadState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
