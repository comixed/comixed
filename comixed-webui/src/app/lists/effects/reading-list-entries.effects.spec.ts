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

import { ReadingListEntriesEffects } from './reading-list-entries.effects';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import { COMIC_DETAIL_1 } from '@app/comic-books/comic-books.fixtures';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import {
  addComicBooksToReadingListFailure,
  addComicBooksToReadingListSuccess,
  addSelectedComicBooksToReadingList,
  removeComicBooksFromReadingListFailure,
  removeComicBooksFromReadingListSuccess,
  removeSelectedComicBooksFromReadingList
} from '@app/lists/actions/reading-list-entries.actions';
import { readingListLoaded } from '@app/lists/actions/reading-list-detail.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ReadingListEntriesEffects', () => {
  const READING_LIST = READING_LIST_3;
  const COMIC_DETAIL = COMIC_DETAIL_1;

  let actions$: Observable<any>;
  let effects: ReadingListEntriesEffects;
  let readingListService: jasmine.SpyObj<ReadingListService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ReadingListEntriesEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadingListService,
          useValue: {
            addSelectedComicBooks: jasmine.createSpy(
              'ReadingListService.addSelectedComicBooks()'
            ),
            removeSelectedComicBooks: jasmine.createSpy(
              'ReadingListService.removeSelectedComicBooks()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ReadingListEntriesEffects);
    readingListService = TestBed.inject(
      ReadingListService
    ) as jasmine.SpyObj<ReadingListService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('adding selected comic books to a reading list', () => {
    it('fires an action on success', () => {
      const serviceResponse = READING_LIST;
      const action = addSelectedComicBooksToReadingList({
        list: READING_LIST
      });
      const outcome1 = addComicBooksToReadingListSuccess();
      const outcome2 = readingListLoaded({ list: READING_LIST });

      actions$ = hot('-a', { a: action });
      readingListService.addSelectedComicBooks
        .withArgs({ list: READING_LIST })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.adSelectedComicBooksToReadingList$).toBeObservable(
        expected
      );
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = addSelectedComicBooksToReadingList({
        list: READING_LIST
      });
      const outcome = addComicBooksToReadingListFailure();

      actions$ = hot('-a', { a: action });
      readingListService.addSelectedComicBooks
        .withArgs({ list: READING_LIST })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.adSelectedComicBooksToReadingList$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = addSelectedComicBooksToReadingList({
        list: READING_LIST
      });
      const outcome = addComicBooksToReadingListFailure();

      actions$ = hot('-a', { a: action });
      readingListService.addSelectedComicBooks
        .withArgs({ list: READING_LIST })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.adSelectedComicBooksToReadingList$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('removing selected comic books from a reading list', () => {
    it('fires an action on success', () => {
      const serviceResponse = READING_LIST;
      const action = removeSelectedComicBooksFromReadingList({
        list: READING_LIST
      });
      const outcome1 = removeComicBooksFromReadingListSuccess();
      const outcome2 = readingListLoaded({ list: READING_LIST });

      actions$ = hot('-a', { a: action });
      readingListService.removeSelectedComicBooks
        .withArgs({
          list: READING_LIST
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.removeSelectedComicBooksFromReadingList$).toBeObservable(
        expected
      );
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = removeSelectedComicBooksFromReadingList({
        list: READING_LIST
      });
      const outcome = removeComicBooksFromReadingListFailure();

      actions$ = hot('-a', { a: action });
      readingListService.removeSelectedComicBooks
        .withArgs({
          list: READING_LIST
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeSelectedComicBooksFromReadingList$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = removeSelectedComicBooksFromReadingList({
        list: READING_LIST
      });
      const outcome = removeComicBooksFromReadingListFailure();

      actions$ = hot('-a', { a: action });
      readingListService.removeSelectedComicBooks
        .withArgs({
          list: READING_LIST
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.removeSelectedComicBooksFromReadingList$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
