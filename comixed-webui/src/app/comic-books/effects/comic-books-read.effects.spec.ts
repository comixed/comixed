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

import { ComicBooksReadEffects } from './comic-books-read.effects';
import { LastReadService } from '@app/comic-books/services/last-read.service';
import { AlertService } from '@app/core/services/alert.service';
import {
  COMIC_DETAIL_4,
  LAST_READ_2
} from '@app/comic-books/comic-books.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  markSelectedComicBooksRead,
  markSelectedComicBooksReadFailed,
  markSelectedComicBooksReadSuccess,
  markSingleComicBookRead
} from '@app/comic-books/actions/comic-books-read.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { loadUnreadComicBookCount } from '@app/comic-books/actions/last-read-list.actions';

describe('ComicBooksReadEffects', () => {
  const COMIC = COMIC_DETAIL_4;
  const READ = Math.random() > 0.5;
  const ENTRY = LAST_READ_2;

  let actions$: Observable<any>;
  let effects: ComicBooksReadEffects;
  let lastReadService: jasmine.SpyObj<LastReadService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ComicBooksReadEffects,
        provideMockActions(() => actions$),
        {
          provide: LastReadService,
          useValue: {
            setSingleReadState: jasmine.createSpy(
              'LastReadService.setSingleReadState()'
            ),
            setSelectedReadState: jasmine.createSpy(
              'LastReadService.setSelectedReadState()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ComicBooksReadEffects);
    lastReadService = TestBed.inject(
      LastReadService
    ) as jasmine.SpyObj<LastReadService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('updating the read state of a single comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRY;
      const action = markSingleComicBookRead({
        comicBookId: COMIC.comicId,
        read: READ
      });
      const outcome1 = markSelectedComicBooksReadSuccess();
      const outcome2 = loadUnreadComicBookCount();

      actions$ = hot('-a', { a: action });
      lastReadService.setSingleReadState
        .withArgs({ comicBookId: COMIC.comicId, read: READ })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.setSingleComicBookReadState$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = markSingleComicBookRead({
        comicBookId: COMIC.comicId,
        read: READ
      });
      const outcome = markSelectedComicBooksReadFailed();

      actions$ = hot('-a', { a: action });
      lastReadService.setSingleReadState
        .withArgs({ comicBookId: COMIC.comicId, read: READ })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSingleComicBookReadState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = markSingleComicBookRead({
        comicBookId: COMIC.comicId,
        read: READ
      });
      const outcome = markSelectedComicBooksReadFailed();

      actions$ = hot('-a', { a: action });
      lastReadService.setSingleReadState
        .withArgs({ comicBookId: COMIC.comicId, read: READ })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSingleComicBookReadState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('updating the read state of selected comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRY;
      const action = markSelectedComicBooksRead({
        read: READ
      });
      const outcome1 = markSelectedComicBooksReadSuccess();
      const outcome2 = loadUnreadComicBookCount();

      actions$ = hot('-a', { a: action });
      lastReadService.setSelectedReadState
        .withArgs({ read: READ })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
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
      lastReadService.setSelectedReadState
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
      lastReadService.setSelectedReadState
        .withArgs({ read: READ })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSelectedComicBooksReadState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
