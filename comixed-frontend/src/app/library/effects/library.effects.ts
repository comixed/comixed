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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  LibraryActionTypes,
  LibraryBlockPageHash,
  LibraryBlockPageHashFailed,
  LibraryClearMetadata,
  LibraryClearMetadataFailed,
  LibraryComicUpdated,
  LibraryDeleteMultipleComics,
  LibraryDeleteMultipleComicsFailed,
  LibraryFormatsReceived,
  LibraryGetFormatsFailed,
  LibraryGetScanTypesFailed,
  LibraryGetUpdates,
  LibraryGetUpdatesFailed,
  LibraryGotScanTypes,
  LibraryMetadataCleared,
  LibraryMultipleComicsDeleted,
  LibraryPageHashBlocked,
  LibraryRescanStarted,
  LibraryStartRescanFailed,
  LibraryUpdateComic,
  LibraryUpdateComicFailed,
  LibraryUpdatesReceived
} from '../actions/library.actions';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { LibraryService } from 'app/library/services/library.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { BlockedPageResponse } from 'app/library/models/net/blocked-page-response';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { GetLibraryUpdateResponse } from 'app/library/models/net/get-library-update-response';

@Injectable()
export class LibraryEffects {
  constructor(
    private actions$: Actions,
    private libraryService: LibraryService,
    private translateService: TranslateService,
    private messageService: MessageService
  ) {}

  @Effect()
  getScanTypes$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.GetScanTypes),
    switchMap(action =>
      this.libraryService.getScanTypes().pipe(
        map(response => new LibraryGotScanTypes({ scanTypes: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'library-effects.get-sort-types.error.details'
            )
          });
          return of(new LibraryGetScanTypesFailed());
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
      return of(new LibraryGetScanTypesFailed());
    })
  );

  @Effect()
  getFormats$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.GetFormats),
    switchMap(action => {
      return this.libraryService.getFormats().pipe(
        map(response => new LibraryFormatsReceived({ formats: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'library-effects.get-formats.error.details'
            )
          });
          return of(new LibraryGetFormatsFailed());
        })
      );
    }),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryGetFormatsFailed());
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
          action.maximumResults
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
  saveComic$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.UpdateComic),
    map((action: LibraryUpdateComic) => action.payload),
    switchMap(action =>
      this.libraryService.saveComic(action.comic).pipe(
        tap(response =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'library-effects.update-comic.success.detail'
            )
          })
        ),
        map(response => new LibraryComicUpdated({ comic: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'library-effects.update-comic.failure.detail'
            )
          });
          return of(new LibraryUpdateComicFailed());
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
      return of(new LibraryUpdateComicFailed());
    })
  );

  @Effect()
  clearComicMetadata$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.ClearMetadata),
    map((action: LibraryClearMetadata) => action.payload),
    switchMap(action =>
      this.libraryService.clearComicMetadata(action.comic).pipe(
        tap(response =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'library-effects.clear-metadata.success.detail'
            )
          })
        ),
        map(reponse => new LibraryMetadataCleared({ comic: reponse })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'library-effects.clear-metadata.failure.detail'
            )
          });
          return of(new LibraryClearMetadataFailed());
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
      return of(new LibraryClearMetadataFailed());
    })
  );

  @Effect()
  setPageHashBlockedState$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.BlockPageHash),
    map((action: LibraryBlockPageHash) => action.payload),
    switchMap(action =>
      this.libraryService
        .setPageHashBlockedState(action.hash, action.blocked)
        .pipe(
          tap((response: BlockedPageResponse) =>
            this.messageService.add({
              severity: 'info',
              detail: this.translateService.instant(
                response.blocked
                  ? 'library-effects.block-page-page.success.blocked-detail'
                  : 'library-effects.block-page-hash.success.unblocked-detail',
                { hash: response.hash }
              )
            })
          ),
          map(
            (response: BlockedPageResponse) =>
              new LibraryPageHashBlocked({
                hash: response.hash,
                blocked: response.blocked
              })
          ),
          catchError(error => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'library-effects.block-page-hash.failure.detail'
              )
            });
            return of(new LibraryBlockPageHashFailed());
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
      return of(new LibraryBlockPageHashFailed());
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
