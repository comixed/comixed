/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { ComicListEffects } from './comic-list.effects';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import {
  READ_COMIC_BOOK_1,
  READ_COMIC_BOOK_2,
  READ_COMIC_BOOK_3,
  READ_COMIC_BOOK_4,
  READ_COMIC_BOOK_5
} from '@app/user/user.fixtures';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { DisplayableComicService } from '@app/comic-books/services/displayable-comic.service';
import { LoadComicsResponse } from '@app/comic-books/models/net/load-comics-response';
import {
  loadComicsByFilter,
  loadComicsById,
  loadComicsFailure,
  loadComicsForCollection,
  loadComicsForReadingList,
  loadComicsSuccess,
  loadDuplicateComics,
  loadReadComics,
  loadUnreadComics
} from '@app/comic-books/actions/comic-list.actions';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';

describe('ComicListEffects', () => {
  const PAGE_SIZE = 25;
  const PAGE_INDEX = Math.abs(Math.random() * 1000);
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const SELECTED_STATE = Math.random() > 0.5;
  const SCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const SORT_BY = 'addedDate';
  const SORT_DIRECTION = 'ASC';
  const TAG_TYPE = ComicTagType.TEAM;
  const TAG_VALUE = 'The Avengers';
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const LAST_READ_ENTRIES = [
    READ_COMIC_BOOK_1,
    READ_COMIC_BOOK_2,
    READ_COMIC_BOOK_3,
    READ_COMIC_BOOK_4,
    READ_COMIC_BOOK_5
  ];
  const PUBLISHER = COMIC_LIST[0].publisher;
  const SERIES = COMIC_LIST[0].series;
  const VOLUME = COMIC_LIST[0].volume;
  const PAGE_COUNT = 0;
  const IDS = COMIC_LIST.map(entry => entry.comicBookId);
  const COVER_YEARS = [1965, 1971, 1996, 1998, 2006];
  const COVER_MONTHS = [1, 3, 4, 7, 9];
  const TOTAL_COUNT = COMIC_LIST.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);
  const READING_LIST_ID = READING_LIST_3.readingListId;

  let actions$: Observable<any>;
  let effects: ComicListEffects;
  let displayableComicService: jasmine.SpyObj<DisplayableComicService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicListEffects,
        provideMockActions(() => actions$),
        {
          provide: DisplayableComicService,
          useValue: {
            loadComicsByFilter: jasmine.createSpy(
              'DisplayableComicsService.loadComicsByFilter()'
            ),
            loadComicsById: jasmine.createSpy(
              'DisplayableComicsService.loadComicsById()'
            ),
            loadComicsForCollection: jasmine.createSpy(
              'DisplayableComicsService.loadComicsForCollection()'
            ),
            loadComicsByReadState: jasmine.createSpy(
              'DisplayableComicsService.loadComicsByReadState()'
            ),
            loadComicsForReadingList: jasmine.createSpy(
              'DisplayableComicsService.loadComicsForReadingList()'
            ),
            loadDuplicateComics: jasmine.createSpy(
              'DisplayableComicsService.loadDuplicateComics()'
            )
          }
        }
      ],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ]
    });

    effects = TestBed.inject(ComicListEffects);
    displayableComicService = TestBed.inject(
      DisplayableComicService
    ) as jasmine.SpyObj<DisplayableComicService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading comics by filter', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicsResponse;
      const action = loadComicsByFilter({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        selected: SELECTED_STATE,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        pageCount: PAGE_COUNT,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsSuccess({
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByFilter
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          selected: SELECTED_STATE,
          unscrapedState: SCRAPED_STATE,
          searchText: SEARCH_TEXT,
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          pageCount: PAGE_COUNT,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsByFilter$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicsByFilter({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        selected: SELECTED_STATE,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        pageCount: PAGE_COUNT,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByFilter
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          selected: SELECTED_STATE,
          unscrapedState: SCRAPED_STATE,
          searchText: SEARCH_TEXT,
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          pageCount: PAGE_COUNT,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsByFilter$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicsByFilter({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        selected: SELECTED_STATE,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        pageCount: PAGE_COUNT,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByFilter
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          selected: SELECTED_STATE,
          unscrapedState: SCRAPED_STATE,
          searchText: SEARCH_TEXT,
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          pageCount: PAGE_COUNT,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicsByFilter$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading selected comics', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicsResponse;
      const action = loadComicsById({ ids: IDS });
      const outcome = loadComicsSuccess({
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsById
        .withArgs({ ids: IDS })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsById$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicsById({ ids: IDS });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsById
        .withArgs({ ids: IDS })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsById$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicsById({ ids: IDS });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsById
        .withArgs({ ids: IDS })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicsById$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading comics for collection', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicsResponse;
      const action = loadComicsForCollection({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsSuccess({
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsForCollection
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsForCollection$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicsForCollection({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsForCollection
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsForCollection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicsForCollection({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsForCollection
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicsForCollection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading unread comics', () => {
    it('fires an action on unread success', () => {
      const serverResponse = {
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicsResponse;
      const action = loadUnreadComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsSuccess({
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByReadState
        .withArgs({
          unreadOnly: true,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUnreadComics$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadUnreadComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByReadState
        .withArgs({
          unreadOnly: true,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUnreadComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadUnreadComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByReadState
        .withArgs({
          unreadOnly: true,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadUnreadComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading read comics', () => {
    it('fires an action on unread success', () => {
      const serverResponse = {
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicsResponse;
      const action = loadReadComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsSuccess({
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByReadState
        .withArgs({
          unreadOnly: false,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadReadComics$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadReadComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByReadState
        .withArgs({
          unreadOnly: false,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadReadComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadReadComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsByReadState
        .withArgs({
          unreadOnly: false,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadReadComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading comics for reading list', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicsResponse;
      const action = loadComicsForReadingList({
        readingListId: READING_LIST_ID,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsSuccess({
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsForReadingList
        .withArgs({
          readingListId: READING_LIST_ID,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsForReadingList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicsForReadingList({
        readingListId: READING_LIST_ID,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsForReadingList
        .withArgs({
          readingListId: READING_LIST_ID,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicsForReadingList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicsForReadingList({
        readingListId: READING_LIST_ID,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadComicsForReadingList
        .withArgs({
          readingListId: READING_LIST_ID,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicsForReadingList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading duplicate comics', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicsResponse;
      const action = loadDuplicateComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsSuccess({
        comics: COMIC_LIST,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      displayableComicService.loadDuplicateComics
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicateComicsDetails$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadDuplicateComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadDuplicateComics
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDuplicateComicsDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadDuplicateComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicsFailure();

      actions$ = hot('-a', { a: action });
      displayableComicService.loadDuplicateComics
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadDuplicateComicsDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
