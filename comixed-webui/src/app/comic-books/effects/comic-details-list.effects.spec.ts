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

import { ComicDetailsListEffects } from './comic-details-list-effects.service';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { ComicBookListService } from '@app/comic-books/services/comic-book-list.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  comicDetailsLoaded,
  loadComicDetails,
  loadComicDetailsById,
  loadComicDetailsFailed
} from '@app/comic-books/actions/comic-details-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/core/services/alert.service';
import { LoadComicDetailsResponse } from '@app/comic-books/models/net/load-comic-details-response';

describe('ComicDetailsListEffects', () => {
  const PAGE_SIZE = 25;
  const PAGE_INDEX = Math.abs(Math.random() * 1000);
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const READ_STATE = Math.random() > 0.5;
  const SCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const SORT_BY = 'addedDate';
  const SORT_DIRECTION = 'ASC';
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const PUBLISHER = COMIC_DETAILS[0].publisher;
  const SERIES = COMIC_DETAILS[0].series;
  const VOLUME = COMIC_DETAILS[0].volume;
  const IDS = COMIC_DETAILS.map(entry => entry.comicId);
  const COVER_YEARS = [1965, 1971, 1996, 1998, 2006];
  const COVER_MONTHS = [1, 3, 4, 7, 9];
  const TOTAL_COUNT = COMIC_DETAILS.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);

  let actions$: Observable<any>;
  let effects: ComicDetailsListEffects;
  let comicBookListService: jasmine.SpyObj<ComicBookListService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicDetailsListEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicBookListService,
          useValue: {
            loadComicDetails: jasmine.createSpy(
              'ComicBookListService.loadComicDetails()'
            ),
            loadComicDetailsById: jasmine.createSpy(
              'ComicBookListService.loadComicDetailsById()'
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
    comicBookListService = TestBed.inject(
      ComicBookListService
    ) as jasmine.SpyObj<ComicBookListService>;
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
        filteredCount: FILTERED_COUNT
      } as LoadComicDetailsResponse;
      const action = loadComicDetails({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        readState: READ_STATE,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      });
      const outcome = comicDetailsLoaded({
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      comicBookListService.loadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          readState: READ_STATE,
          unscrapedState: SCRAPED_STATE,
          searchText: SEARCH_TEXT,
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
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
        readState: READ_STATE,
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
      comicBookListService.loadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          readState: READ_STATE,
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
        readState: READ_STATE,
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
      comicBookListService.loadComicDetails
        .withArgs({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          readState: READ_STATE,
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
        filteredCount: FILTERED_COUNT
      } as LoadComicDetailsResponse;
      const action = loadComicDetailsById({ comicBookIds: IDS });
      const outcome = comicDetailsLoaded({
        comicDetails: COMIC_DETAILS,
        coverYears: COVER_YEARS,
        coverMonths: COVER_MONTHS,
        totalCount: TOTAL_COUNT,
        filteredCount: FILTERED_COUNT
      });

      actions$ = hot('-a', { a: action });
      comicBookListService.loadComicDetailsById
        .withArgs({ ids: IDS })
        .and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicDetailsById$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = loadComicDetailsById({ comicBookIds: IDS });
      const outcome = loadComicDetailsFailed();

      actions$ = hot('-a', { a: action });
      comicBookListService.loadComicDetailsById
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
      comicBookListService.loadComicDetailsById
        .withArgs({ ids: IDS })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicDetailsById$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
