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
import { ComicBookListEffects } from './comic-book-list.effects';
import { ComicBookListService } from '@app/comic-books/services/comic-book-list.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import {
  comicBooksReceived,
  loadComicBooks,
  loadComicBooksFailed
} from '@app/comic-books/actions/comic-book-list.actions';
import { hot } from 'jasmine-marbles';
import { ComicBookService } from '@app/comic-books/services/comic-book.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadComicsResponse } from '@app/comic-books/models/net/load-comics-response';

describe('ComicBookListEffects', () => {
  const COMIC_BOOKS = [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5];
  const MAX_RECORDS = 1000;
  const LAST_ID = Math.floor(Math.abs(Math.random() * 1000));
  const LAST_PAGE = Math.random() > 0.5;

  let actions$: Observable<any> = null;
  let effects: ComicBookListEffects;
  let comicService: jasmine.SpyObj<ComicBookService>;
  let comicListService: jasmine.SpyObj<ComicBookListService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        ComicBookListEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicBookService,
          useValue: {
            loadBatch: jasmine.createSpy('ComicBookService.loadBatch()')
          }
        },
        {
          provide: ComicBookListService,
          useValue: {}
        }
      ]
    });

    effects = TestBed.inject(ComicBookListEffects);
    comicService = TestBed.inject(
      ComicBookService
    ) as jasmine.SpyObj<ComicBookService>;
    comicListService = TestBed.inject(
      ComicBookListService
    ) as jasmine.SpyObj<ComicBookListService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a batch of comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comicBooks: COMIC_BOOKS,
        lastId: LAST_ID,
        lastPayload: LAST_PAGE
      } as LoadComicsResponse;
      const action = loadComicBooks({
        maxRecords: MAX_RECORDS,
        lastId: LAST_ID
      });
      const outcome = comicBooksReceived({
        comicBooks: COMIC_BOOKS,
        lastId: LAST_ID,
        lastPayload: LAST_PAGE
      });

      actions$ = hot('-a', { a: action });
      comicService.loadBatch
        .withArgs({ maxRecords: MAX_RECORDS, lastId: LAST_ID })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadBatch$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicBooks({
        maxRecords: MAX_RECORDS,
        lastId: LAST_ID
      });
      const outcome = loadComicBooksFailed();

      actions$ = hot('-a', { a: action });
      comicService.loadBatch
        .withArgs({
          maxRecords: MAX_RECORDS,
          lastId: LAST_ID
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadBatch$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = loadComicBooks({
        maxRecords: MAX_RECORDS,
        lastId: LAST_ID
      });
      const outcome = loadComicBooksFailed();

      actions$ = hot('-a', { a: action });
      comicService.loadBatch
        .withArgs({ maxRecords: MAX_RECORDS, lastId: LAST_ID })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadBatch$).toBeObservable(expected);
    });
  });
});
