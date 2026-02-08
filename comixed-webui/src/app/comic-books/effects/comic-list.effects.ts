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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  loadComicsByFilter,
  loadComicsById,
  loadComicsFailure,
  loadComicsForCollection,
  loadComicsForReadingList,
  loadComicsSuccess,
  loadReadComics,
  loadUnreadComics
} from '../actions/comic-list.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DisplayableComicService } from '@app/comic-books/services/displayable-comic.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LoadComicsResponse } from '@app/comic-books/models/net/load-comics-response';
import { of } from 'rxjs';

@Injectable()
export class ComicListEffects {
  actions$ = inject(Actions);
  logger = inject(LoggerService);
  displayableComicService = inject(DisplayableComicService);

  loadComicsByFilter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicsByFilter),
      tap(action => this.logger.debug('Loading comics by filter:', action)),
      switchMap(action =>
        this.displayableComicService
          .loadComicsByFilter({
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            coverYear: action.coverYear,
            coverMonth: action.coverMonth,
            archiveType: action.archiveType,
            comicType: action.comicType,
            comicState: action.comicState,
            selected: action.selected,
            missing: action.missing,
            unscrapedState: action.unscrapedState,
            searchText: action.searchText,
            publisher: action.publisher,
            series: action.series,
            volume: action.volume,
            pageCount: action.pageCount,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadComicsResponse) => this.doSuccess(response)),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });
  loadComicsById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicsById),
      tap(action => this.logger.debug('Loading comics by id:', action)),
      switchMap(action =>
        this.displayableComicService
          .loadComicsById({
            ids: action.ids
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadComicsResponse) => this.doSuccess(response)),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });
  loadComicsForCollection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicsForCollection),
      tap(action =>
        this.logger.debug('Loading comics for collection:', action)
      ),
      switchMap(action =>
        this.displayableComicService
          .loadComicsForCollection({
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            tagType: action.tagType,
            tagValue: action.tagValue,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadComicsResponse) => this.doSuccess(response)),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });
  loadUnreadComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUnreadComics),
      tap(action => this.logger.debug('Loading unread comic details:', action)),
      switchMap(action =>
        this.displayableComicService
          .loadComicsByReadState({
            unreadOnly: true,
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadComicsResponse) => this.doSuccess(response)),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });
  loadReadComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadReadComics),
      tap(action => this.logger.debug('Loading read comic details:', action)),
      switchMap(action =>
        this.displayableComicService
          .loadComicsByReadState({
            unreadOnly: false,
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadComicsResponse) => this.doSuccess(response)),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });
  loadComicsForReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicsForReadingList),
      tap(action =>
        this.logger.debug('Loading comic details for reading list:', action)
      ),
      switchMap(action =>
        this.displayableComicService
          .loadComicsForReadingList({
            readingListId: action.readingListId,
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadComicsResponse) => this.doSuccess(response)),
            catchError(error => this.doServiceFailure(error))
          )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  alertService = inject(AlertService);
  translateService = inject(TranslateService);

  private doSuccess(response: LoadComicsResponse) {
    return loadComicsSuccess({
      comics: response.comics,
      coverYears: response.coverYears,
      coverMonths: response.coverMonths,
      totalCount: response.totalCount,
      filteredCount: response.filteredCount
    });
  }

  private doServiceFailure(error: any) {
    this.logger.debug('Service failure:', error);
    this.alertService.error(
      this.translateService.instant('comic-books.load-comics.effect-failure')
    );
    return of(loadComicsFailure());
  }

  private doGeneralFailure(error: any) {
    this.logger.debug('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(loadComicsFailure());
  }
}
