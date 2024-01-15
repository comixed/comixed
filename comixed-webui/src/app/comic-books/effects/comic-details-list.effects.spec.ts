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

import { ComicDetailsListEffects } from './comic-details-list.effects';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5,
  LAST_READ_1,
  LAST_READ_2,
  LAST_READ_3,
  LAST_READ_4,
  LAST_READ_5
} from '@app/comic-books/comic-books.fixtures';
import { ComicDetailListService } from '@app/comic-books/services/comic-detail-list.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  comicDetailsLoaded,
  loadComicDetails,
  loadComicDetailsById,
  loadComicDetailsFailed,
  loadComicDetailsForCollection,
  loadComicDetailsForReadingList,
  loadUnreadComicDetails
} from '@app/comic-books/actions/comic-details-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/core/services/alert.service';
import { LoadComicDetailsResponse } from '@app/comic-books/models/net/load-comic-details-response';
import { TagType } from '@app/collections/models/comic-collection.enum';
import { setLastReadList } from '@app/comic-books/actions/last-read-list.actions';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';

describe('ComicDetailsListEffects', () => {
  const PAGE_SIZE = 25;
  const PAGE_INDEX = Math.abs(Math.random() * 1000);
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const SCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const SORT_BY = 'addedDate';
  const SORT_DIRECTION = 'ASC';
  const TAG_TYPE = TagType.TEAMS;
  const TAG_VALUE = 'The Avengers';
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const LAST_READ_ENTRIES = [
    LAST_READ_1,
    LAST_READ_2,
    LAST_READ_3,
    LAST_READ_4,
    LAST_READ_5
  ];
  const PUBLISHER = COMIC_DETAILS[0].publisher;
  const SERIES = COMIC_DETAILS[0].series;
  const VOLUME = COMIC_DETAILS[0].volume;
  const IDS = COMIC_DETAILS.map(entry => entry.comicId);
  const COVER_YEARS = [1965, 1971, 1996, 1998, 2006];
  const COVER_MONTHS = [1, 3, 4, 7, 9];
  const TOTAL_COUNT = COMIC_DETAILS.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);
  const READING_LIST_ID = READING_LIST_3.id;

  let actions$: Observable<any>;
  let effects: ComicDetailsListEffects;
  let comicDetailListService: jasmine.SpyObj<ComicDetailListService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicDetailsListEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicDetailListService,
          useValue: {
            loadComicDetails: jasmine.createSpy(
              'ComicDetailListService.loadComicDetails()'
            ),
            loadComicDetailsById: jasmine.createSpy(
              'ComicDetailListService.loadComicDetailsById()'
            ),
            loadComicDetailsForCollection: jasmine.createSpy(
              'ComicDetailListService.loadComicDetailsForCollection()'
            ),
            loadUnreadComicDetails: jasmine.createSpy(
              'ComicDetailListService.loadUnreadComicDetails()'
            ),
            loadComicDetailsForReadingList: jasmine.createSpy(
              'ComicDetailListService.loadComicDetailsForReadingList()'
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

    effects = TestBed.inject(ComicDetailsListEffects);
    comicDetailListService = TestBed.inject(
      ComicDetailListService
    ) as jasmine.SpyObj<ComicDetailListService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading comic details', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicDetailsResponse;
      const action = loadComicDetails({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome1 = comicDetailsLoaded({
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });
      const outcome2 = setLastReadList({ entries: LAST_READ_ENTRIES });

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          unscrapedState: SCRAPED_STATE,
          searchText: SEARCH_TEXT,
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadComicDetails$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicDetails({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          unscrapedState: SCRAPED_STATE,
          searchText: SEARCH_TEXT,
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicDetails({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          unscrapedState: SCRAPED_STATE,
          searchText: SEARCH_TEXT,
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading comic details by id', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicDetailsResponse;
      const action = loadComicDetailsById({ comicBookIds: IDS });
      const outcome1 = comicDetailsLoaded({
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });
      const outcome2 = setLastReadList({ entries: LAST_READ_ENTRIES });

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsById
        .withArgs({ ids: IDS })
        .and.returnValue(of(serverResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadComicDetailsById$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicDetailsById({ comicBookIds: IDS });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsById
        .withArgs({ ids: IDS })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicDetailsById$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicDetailsById({ comicBookIds: IDS });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsById
        .withArgs({ ids: IDS })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicDetailsById$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading comic details for collection', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicDetailsResponse;
      const action = loadComicDetailsForCollection({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome1 = comicDetailsLoaded({
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });
      const outcome2 = setLastReadList({ entries: LAST_READ_ENTRIES });

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsForCollection
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadComicDetailsForCollection$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicDetailsForCollection({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsForCollection
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
      expect(effects.loadComicDetailsForCollection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicDetailsForCollection({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsForCollection
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
      expect(effects.loadComicDetailsForCollection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading comic details unread by user', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicDetailsResponse;
      const action = loadUnreadComicDetails({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome1 = comicDetailsLoaded({
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });
      const outcome2 = setLastReadList({ entries: LAST_READ_ENTRIES });

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadUnreadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadUnreadComicDetails$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadUnreadComicDetails({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadUnreadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUnreadComicDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadUnreadComicDetails({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadUnreadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadUnreadComicDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading comic details for reading list', () => {
    it('fires an action on success', () => {
      const serverResponse = {
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT,
        lastReadEntries: LAST_READ_ENTRIES
      } as LoadComicDetailsResponse;
      const action = loadComicDetailsForReadingList({
        readingListId: READING_LIST_ID,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome1 = comicDetailsLoaded({
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });
      const outcome2 = setLastReadList({ entries: LAST_READ_ENTRIES });

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsForReadingList
        .withArgs({
          readingListId: READING_LIST_ID,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadComicDetailsForReadingList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicDetailsForReadingList({
        readingListId: READING_LIST_ID,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsForReadingList
        .withArgs({
          readingListId: READING_LIST_ID,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicDetailsForReadingList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicDetailsForReadingList({
        readingListId: READING_LIST_ID,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicDetailListService.loadComicDetailsForReadingList
        .withArgs({
          readingListId: READING_LIST_ID,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicDetailsForReadingList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
