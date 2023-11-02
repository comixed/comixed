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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import {
  comicDetailsLoaded,
  loadComicDetails,
  loadComicDetailsById,
  loadComicDetailsFailed,
  loadComicDetailsForCollection
} from '../actions/comic-details-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicDetailListService } from '@app/comic-books/services/comic-detail-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LoadComicDetailsResponse } from '@app/comic-books/models/net/load-comic-details-response';
import { setLastReadList } from '@app/comic-books/actions/last-read-list.actions';

@Injectable()
export class ComicDetailsListEffects {
  loadComicDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicDetails),
      switchMap(action =>
        this.comicBookListService
          .loadComicDetails({
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            coverYear: action.coverYear,
            coverMonth: action.coverMonth,
            archiveType: action.archiveType,
            comicType: action.comicType,
            comicState: action.comicState,
            readState: action.readState,
            unscrapedState: action.unscrapedState,
            searchText: action.searchText,
            publisher: action.publisher,
            series: action.series,
            volume: action.volume,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            mergeMap((response: LoadComicDetailsResponse) =>
              this.doComicDetailsLoaded(response)
            ),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  loadComicDetailsById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicDetailsById),
      switchMap(action =>
        this.comicBookListService
          .loadComicDetailsById({
            ids: action.comicBookIds
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            mergeMap((response: LoadComicDetailsResponse) =>
              this.doComicDetailsLoaded(response)
            ),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  loadComicDetailsForCollection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicDetailsForCollection),
      switchMap(action =>
        this.comicBookListService
          .loadComicDetailsForCollection({
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            tagType: action.tagType,
            tagValue: action.tagValue,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            mergeMap((response: LoadComicDetailsResponse) =>
              this.doComicDetailsLoaded(response)
            ),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  constructor(
    private actions$: Actions,
    private logger: LoggerService,
    private comicBookListService: ComicDetailListService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  private doComicDetailsLoaded(response: LoadComicDetailsResponse) {
    return [
      comicDetailsLoaded({
        comicDetails: response.comicDetails,
        coverYears: response.coverYears,
        coverMonths: response.coverMonths,
        totalCount: response.totalCount,
        filteredCount: response.filteredCount
      }),
      setLastReadList({ entries: response.lastReadEntries })
    ];
  }

  private doServiceFailure(error: any) {
    this.logger.debug('Service failure:', error);
    this.alertService.error(
      this.translateService.instant('comic-books.load-comics.effect-failure')
    );
    return of(loadComicDetailsFailed());
  }

  private doGeneralFailure(error: any) {
    this.logger.debug('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(loadComicDetailsFailed());
  }
}
