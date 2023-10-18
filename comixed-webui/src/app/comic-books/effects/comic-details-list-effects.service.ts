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
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  comicDetailsLoaded,
  loadComicDetails,
  loadComicDetailsById,
  loadComicDetailsFailed
} from '../actions/comic-details-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookListService } from '@app/comic-books/services/comic-book-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LoadComicDetailsResponse } from '@app/comic-books/models/net/load-comic-details-response';

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
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadComicDetailsResponse) =>
              comicDetailsLoaded({
                comicDetails: response.comicDetails,
                totalCount: response.totalCount,
                filteredCount: response.filteredCount
              })
            ),
            catchError(error => {
              this.logger.debug('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-books.load-comics.effect-failure'
                )
              );
              return of(loadComicDetailsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.debug('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicDetailsFailed());
      })
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
            map((response: LoadComicDetailsResponse) =>
              comicDetailsLoaded({
                comicDetails: response.comicDetails,
                totalCount: response.totalCount,
                filteredCount: response.filteredCount
              })
            ),
            catchError(error => {
              this.logger.debug('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-books.load-comics.effect-failure'
                )
              );
              return of(loadComicDetailsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.debug('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicDetailsFailed());
      })
    );
  });

  constructor(
    private actions$: Actions,
    private logger: LoggerService,
    private comicBookListService: ComicBookListService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
