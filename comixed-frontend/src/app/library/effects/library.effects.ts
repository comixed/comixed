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
import { Action } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { LibraryService } from 'app/library/services/library.service';
import { NGXLogger } from 'ngx-logger';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  LibraryActionTypes,
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryMultipleComicsDeleted,
  LibraryRescanStarted,
  LibraryStartRescanFailed,
  LibraryUpdatesReceived
} from '../actions/library.actions';

@Injectable()
export class LibraryEffects {
  constructor(
    private actions$: Actions,
    private libraryService: LibraryService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private logger: NGXLogger
  ) {}

  @Effect()
  getUpdates$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.GetUpdates),
    map((action: LibraryGetUpdates) => action.payload),
    tap(action => this.logger.debug('get updates effect:', action)),
    switchMap(action =>
      this.libraryService
        .getUpdatesSince(
          action.lastUpdateDate,
          action.lastComicId,
          action.maximumComics,
          action.processingCount,
          action.timeout
        )
        .pipe(
          tap(response => this.logger.debug('got update response:', response)),
          tap((response: GetLibraryUpdateResponse) =>
            this.logger.debug(
              `received ${response.comics.length} comics in response:`,
              response
            )
          ),
          map(
            (response: GetLibraryUpdateResponse) =>
              new LibraryUpdatesReceived({
                comics: response.comics,
                lastComicId: response.lastComicId,
                mostRecentUpdate: !!response.mostRecentUpdate
                  ? new Date(response.mostRecentUpdate)
                  : null,
                moreUpdates: response.moreUpdates,
                lastReadDates: response.lastReadDates,
                processingCount: response.processingCount
              })
          ),
          catchError(error => {
            this.logger.error('service failure getting updates:', error);
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
      this.logger.error('general failure getting updates:', error);
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
    tap(action => this.logger.debug('start rescan effect:', action)),
    switchMap(action =>
      this.libraryService.startRescan().pipe(
        tap(response => this.logger.debug('got response:', response)),
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
          this.logger.error('service failure starting rescan:', error);
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
      this.logger.error('general failure starting rescan:', error);
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
    tap(action => this.logger.debug('delete multiple comics effect:', action)),
    switchMap(action =>
      this.libraryService.deleteMultipleComics(action.ids).pipe(
        tap(response =>
          this.logger.debug('delete multiple comics response:', response)
        ),
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
          this.logger.error('service failure deleting multiple comics:', error);
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
      this.logger.error('general failure deleting multiple comics:', error);
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
