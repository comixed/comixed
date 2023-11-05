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
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { ScrapeMultiBookComicResponse } from '@app/comic-metadata/models/net/scrape-multi-book-comic-response';
import {
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
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StartMultiBookScrapingResponse } from '@app/comic-metadata/models/net/start-multi-book-scraping-response';
import { RemoveMultiBookComicResponse } from '@app/comic-metadata/models/net/remove-multi-book-comic-response';

describe('MultiBookScrapingEffects', () => {
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const COMIC_BOOKS = [
    COMIC_BOOK_1,
    COMIC_BOOK_2,
    COMIC_BOOK_3,
    COMIC_BOOK_4,
    COMIC_BOOK_5
  ];
  const COMIC_BOOK = COMIC_BOOK_4;
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
            removeMultiBookComic: jasmine.createSpy(
              'ComicBookScrapingService.removeMultiBookComic()'
            ),
            scrapeMultiBookComic: jasmine.createSpy(
              'ComicBookScrapingService.scrapeMultiBookComic()'
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
        comicBooks: COMIC_BOOKS
      } as StartMultiBookScrapingResponse;
      const action = startMultiBookScraping();
      const outcome = startMultiBookScrapingSuccess({
        comicBooks: COMIC_BOOKS
      });

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.startMultiBookScraping
        .withArgs()
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.startMultiBookScraping$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = startMultiBookScraping();
      const outcome = startMultiBookScrapingFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.startMultiBookScraping
        .withArgs()
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.startMultiBookScraping$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = startMultiBookScraping();
      const outcome = startMultiBookScrapingFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.startMultiBookScraping
        .withArgs()
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.startMultiBookScraping$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('removing multi-book comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comicBooks: COMIC_BOOKS
      } as RemoveMultiBookComicResponse;
      const action = multiBookScrapingRemoveBook({ comicBook: COMIC_BOOK });
      const outcome = multiBookScrapingRemoveBookSuccess({
        comicBooks: COMIC_BOOKS
      });

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.removeMultiBookComic
        .withArgs({ comicBook: COMIC_BOOK })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeMultiBookComic$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = multiBookScrapingRemoveBook({ comicBook: COMIC_BOOK });
      const outcome = multiBookScrapingRemoveBookFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.removeMultiBookComic
        .withArgs({ comicBook: COMIC_BOOK })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeMultiBookComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = multiBookScrapingRemoveBook({ comicBook: COMIC_BOOK });
      const outcome = multiBookScrapingRemoveBookFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.removeMultiBookComic
        .withArgs({ comicBook: COMIC_BOOK })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.removeMultiBookComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('scraping a multi-book comic entry', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comicBooks: COMIC_BOOKS
      } as ScrapeMultiBookComicResponse;
      const action = multiBookScrapeComic({
        metadataSource: METADATA_SOURCE,
        issueId: ISSUE_NUMBER,
        comicBook: COMIC_BOOK,
        skipCache: SKIP_CACHE
      });
      const outcome = multiBookScrapeComicSuccess({
        comicBooks: COMIC_BOOKS
      });

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeMultiBookComic
        .withArgs({
          metadataSource: METADATA_SOURCE,
          issueId: ISSUE_NUMBER,
          comicBook: COMIC_BOOK,
          skipCache: SKIP_CACHE
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
        skipCache: SKIP_CACHE
      });
      const outcome = multiBookScrapeComicFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeMultiBookComic
        .withArgs({
          metadataSource: METADATA_SOURCE,
          issueId: ISSUE_NUMBER,
          comicBook: COMIC_BOOK,
          skipCache: SKIP_CACHE
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
        skipCache: SKIP_CACHE
      });
      const outcome = multiBookScrapeComicFailure();

      actions$ = hot('-a', { a: action });
      comicBookScrapingService.scrapeMultiBookComic
        .withArgs({
          metadataSource: METADATA_SOURCE,
          issueId: ISSUE_NUMBER,
          comicBook: COMIC_BOOK,
          skipCache: SKIP_CACHE
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.multiBookScrapeComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
