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
import { MultiBookScrapingEffects } from './multi-book-scraping.effects';
import { ComicBookScrapingService } from '@app/comic-metadata/services/comic-book-scraping.service';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-metadata/comic-metadata.fixtures';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4,
  COMIC_BOOK_5,
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { ScrapeMultiBookComicResponse } from '@app/comic-metadata/models/net/scrape-multi-book-comic-response';
import {
  batchScrapeComicBooks,
  batchScrapeComicBooksFailure,
  batchScrapeComicBooksSuccess,
  loadMultiBookScrapingPage,
  loadMultiBookScrapingPageFailure,
  loadMultiBookScrapingPageSuccess,
  multiBookScrapeComic,
  multiBookScrapeComicFailure,
  multiBookScrapeComicSuccess,
  multiBookScrapingRemoveBook,
  multiBookScrapingRemoveBookFailure,
  multiBookScrapingRemoveBookSuccess,
  startMultiBookScraping,
  startMultiBookScrapingFailure,
  startMultiBookScrapingSuccess
} from '@app/comic-metadata/actions/multi-book-scraping.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StartMultiBookScrapingResponse } from '@app/comic-metadata/models/net/start-multi-book-scraping-response';
import { RemoveMultiBookComicResponse } from '@app/comic-metadata/models/net/remove-multi-book-comic-response';
import { LoadMultiBookScrapingResponse } from '@app/comic-metadata/models/net/load-multi-book-scraping-page-response';

describe('MultiBookScrapingEffects', () => {
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const COMIC_BOOKS = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const PAGE_SIZE = 25;
  const PAGE_NUMBER = 3;
  const TOTAL_COMICS = 100;
  const COMIC_BOOK = DISPLAYABLE_COMIC_1;
  const METADATA_SOURCE = METADATA_SOURCE_1;

  let actions$: Observable<any>;
  let effects: MultiBookScrapingEffects;
  let comicBookScrapingService: jasmine.SpyObj<ComicBookScrapingService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        MultiBookScrapingEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicBookScrapingService,
          useValue: {
            startMultiBookScraping: jasmine.createSpy(
              'ComicBookScrapingService.startMultiBookScraping()'
            ),
            loadMultiBookScrapingPage: jasmine.createSpy(
              'ComicBookScrapingService.loadMultiBookScrapingPage()'
            ),
            removeMultiBookComic: jasmine.createSpy(
              'ComicBookScrapingService.removeMultiBookComic()'
            ),
            scrapeMultiBookComic: jasmine.createSpy(
              'ComicBookScrapingService.scrapeMultiBookComic()'
            ),
            batchScrapeComicBooks: jasmine.createSpy(
              'ComicBookScrapingService.batchScrapeComicBooks()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(MultiBookScrapingEffects);
    comicBookScrapingService = TestBed.inject(
      ComicBookScrapingService
    ) as jasmine.SpyObj<ComicBookScrapingService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('starting multi-book scraping', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER,
        totalComics: TOTAL_COMICS,
        comicBooks: COMIC_BOOKS
      } as StartMultiBookScrapingResponse;
      const action = startMultiBookScraping({ pageSize: PAGE_SIZE });
      const outcome = startMultiBookScrapingSuccess({
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER,
        totalComics: TOTAL_COMICS,
        comicBooks: COMIC_BOOKS
      });

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.startMultiBookScraping
        .withArgs({ pageSize: PAGE_SIZE })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.startMultiBookScraping$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = startMultiBookScraping({ pageSize: PAGE_SIZE });
      const outcome = startMultiBookScrapingFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.startMultiBookScraping
        .withArgs({ pageSize: PAGE_SIZE })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.startMultiBookScraping$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = startMultiBookScraping({ pageSize: PAGE_SIZE });
      const outcome = startMultiBookScrapingFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.startMultiBookScraping
        .withArgs({ pageSize: PAGE_SIZE })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.startMultiBookScraping$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading a page of multi-book scraping comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER,
        totalComics: TOTAL_COMICS,
        comicBooks: COMIC_BOOKS
      } as LoadMultiBookScrapingResponse;
      const action = loadMultiBookScrapingPage({
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER
      });
      const outcome = loadMultiBookScrapingPageSuccess({
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER,
        totalComics: TOTAL_COMICS,
        comicBooks: COMIC_BOOKS
      });

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.loadMultiBookScrapingPage
        .withArgs({
          pageSize: PAGE_SIZE,
          pageNumber: PAGE_NUMBER
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMultiBookScrapingPage$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadMultiBookScrapingPage({
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER
      });
      const outcome = loadMultiBookScrapingPageFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.loadMultiBookScrapingPage
        .withArgs({
          pageSize: PAGE_SIZE,
          pageNumber: PAGE_NUMBER
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMultiBookScrapingPage$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadMultiBookScrapingPage({
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER
      });
      const outcome = loadMultiBookScrapingPageFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.loadMultiBookScrapingPage
        .withArgs({
          pageSize: PAGE_SIZE,
          pageNumber: PAGE_NUMBER
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadMultiBookScrapingPage$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('removing multi-book comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER,
        totalComics: TOTAL_COMICS,
        comicBooks: COMIC_BOOKS
      } as RemoveMultiBookComicResponse;
      const action = multiBookScrapingRemoveBook({
        comicBook: COMIC_BOOK,
        pageSize: PAGE_SIZE
      });
      const outcome = multiBookScrapingRemoveBookSuccess({
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER,
        totalComics: TOTAL_COMICS,
        comicBooks: COMIC_BOOKS
      });

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.removeMultiBookComic
        .withArgs({ comicBook: COMIC_BOOK, pageSize: PAGE_SIZE })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeMultiBookComic$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = multiBookScrapingRemoveBook({
        comicBook: COMIC_BOOK,
        pageSize: PAGE_SIZE
      });
      const outcome = multiBookScrapingRemoveBookFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.removeMultiBookComic
        .withArgs({ comicBook: COMIC_BOOK, pageSize: PAGE_SIZE })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeMultiBookComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = multiBookScrapingRemoveBook({
        comicBook: COMIC_BOOK,
        pageSize: PAGE_SIZE
      });
      const outcome = multiBookScrapingRemoveBookFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.removeMultiBookComic
        .withArgs({ comicBook: COMIC_BOOK, pageSize: PAGE_SIZE })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.removeMultiBookComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('scraping a multi-book comic entry', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER,
        totalComics: TOTAL_COMICS,
        comicBooks: COMIC_BOOKS
      } as ScrapeMultiBookComicResponse;
      const action = multiBookScrapeComic({
        metadataSource: METADATA_SOURCE,
        issueId: ISSUE_NUMBER,
        comicBook: COMIC_BOOK,
        skipCache: SKIP_CACHE,
        pageSize: PAGE_SIZE
      });
      const outcome = multiBookScrapeComicSuccess({
        pageSize: PAGE_SIZE,
        pageNumber: PAGE_NUMBER,
        totalComics: TOTAL_COMICS,
        comicBooks: COMIC_BOOKS
      });

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeMultiBookComic
        .withArgs({
          metadataSource: METADATA_SOURCE,
          issueId: ISSUE_NUMBER,
          comicBook: COMIC_BOOK,
          skipCache: SKIP_CACHE,
          pageSize: PAGE_SIZE
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.multiBookScrapeComic$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = multiBookScrapeComic({
        metadataSource: METADATA_SOURCE,
        issueId: ISSUE_NUMBER,
        comicBook: COMIC_BOOK,
        skipCache: SKIP_CACHE,
        pageSize: PAGE_SIZE
      });
      const outcome = multiBookScrapeComicFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeMultiBookComic
        .withArgs({
          metadataSource: METADATA_SOURCE,
          issueId: ISSUE_NUMBER,
          comicBook: COMIC_BOOK,
          skipCache: SKIP_CACHE,
          pageSize: PAGE_SIZE
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.multiBookScrapeComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = multiBookScrapeComic({
        metadataSource: METADATA_SOURCE,
        issueId: ISSUE_NUMBER,
        comicBook: COMIC_BOOK,
        skipCache: SKIP_CACHE,
        pageSize: PAGE_SIZE
      });
      const outcome = multiBookScrapeComicFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeMultiBookComic
        .withArgs({
          metadataSource: METADATA_SOURCE,
          issueId: ISSUE_NUMBER,
          comicBook: COMIC_BOOK,
          skipCache: SKIP_CACHE,
          pageSize: PAGE_SIZE
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.multiBookScrapeComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('batch scraping comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = batchScrapeComicBooks();
      const outcome = batchScrapeComicBooksSuccess();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.batchScrapeComicBooks.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.batchScrapeComicBooks$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = batchScrapeComicBooks();
      const outcome = batchScrapeComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.batchScrapeComicBooks.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.batchScrapeComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = batchScrapeComicBooks();
      const outcome = batchScrapeComicBooksFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.batchScrapeComicBooks.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.batchScrapeComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
