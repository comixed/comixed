/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  LibraryActionTypes,
  LibraryComicsReceived,
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryGetComics,
  LibraryGetComicsFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryMultipleComicsDeleted,
  LibraryRescanStarted,
  LibraryStartRescanFailed,
  LibraryUpdatesReceived
} from '../actions/library.actions';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { LibraryService } from 'app/library/services/library.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';
import { GetComicsResponse } from 'app/library/models/net/get-comics-response';

@Injectable()
export class LibraryEffects {
  constructor(
    private actions$: Actions,
    private libraryService: LibraryService,
    private translateService: TranslateService,
    private messageService: MessageService
  ) {}

  @Effect()
  getComics$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.GetComics),
    map((action: LibraryGetComics) => action.payload),
    switchMap(action =>
      this.libraryService
        .getComics(
          action.page,
          action.count,
          action.sortField,
          action.ascending
        )
        .pipe(
          map(
            (response: GetComicsResponse) =>
              new LibraryComicsReceived({
                comics: response.comics,
                lastReadDates: response.lastReadDates,
                lastUpdatedDate: response.latestUpdatedDate,
                comicCount: response.comicCount
              })
          ),
          catchError(error => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'library-effects.get-comics.error.detail'
              )
            });
            return of(new LibraryGetComicsFailed());
          })
        )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryGetComicsFailed());
    })
  );

  @Effect()
  getUpdates$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.GetUpdates),
    map((action: LibraryGetUpdates) => action.payload),
    switchMap(action =>
      this.libraryService
        .getUpdatesSince(
          action.timestamp,
          action.timeout,
          action.maximumResults,
          action.lastProcessingCount,
          action.lastRescanCount
        )
        .pipe(
          map(
            (response: GetLibraryUpdateResponse) =>
              new LibraryUpdatesReceived({
                comics: response.comics,
                lastReadDates: response.lastReadDates,
                processingCount: response.processingCount,
                rescanCount: response.rescanCount
              })
          ),
          catchError(error => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'library-effects.get-updates.error.detail'
              )
            });
            return of(new LibraryGetUpdatesFailed());
          })
        )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryGetUpdatesFailed());
    })
  );

  @Effect()
  startRescan$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.StartRescan),
    switchMap(action =>
      this.libraryService.startRescan().pipe(
        tap(() =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'library-effects.start-rescan.success.detail'
            )
          })
        ),
        map(
          (response: StartRescanResponse) =>
            new LibraryRescanStarted({ count: response.count })
        ),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'library-effects.start-rescan.error.detail'
            )
          });
          return of(new LibraryStartRescanFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryStartRescanFailed());
    })
  );

  @Effect()
  deleteMultipleComics$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.DeleteMultipleComics),
    map((action: LibraryDeleteMultipleComics) => action.payload),
    switchMap(action =>
      this.libraryService.deleteMultipleComics(action.ids).pipe(
        tap((response: DeleteMultipleComicsResponse) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'library-effects.delete-multiple-comics.success.detail',
              { count: response.count }
            )
          })
        ),
        map(
          (response: DeleteMultipleComicsResponse) =>
            new LibraryMultipleComicsDeleted({
              count: response.count
            })
        ),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'library-effects.delete-multiple-comics.failure.detail'
            )
          });
          return of(new LibraryDeleteMultipleComicsFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryDeleteMultipleComicsFailed());
    })
  );
}
