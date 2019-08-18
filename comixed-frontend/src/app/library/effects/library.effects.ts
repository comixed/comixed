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
import { LibraryActionTypes } from '../actions/library.actions';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { LibraryService } from 'app/library/services/library.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import * as LibraryActions from 'app/library/actions/library.actions';
import { BlockedPageResponse } from 'app/library/models/net/blocked-page-response';
import { DeleteMultipleComicsResponse } from 'app/library/models/net/delete-multiple-comics-response';
import { StartRescanResponse } from 'app/library/models/net/start-rescan-response';
import { LibraryUpdateResponse } from 'app/library/models/net/library-update-response';

@Injectable()
export class LibraryEffects {
  constructor(
    private actions$: Actions,
    private library_service: LibraryService,
    private translate_service: TranslateService,
    private message_service: MessageService
  ) {}

  @Effect()
  get_scan_types$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.GetScanTypes),
    switchMap(action =>
      this.library_service.get_scan_types().pipe(
        map(
          response =>
            new LibraryActions.LibraryGotScanTypes({ scan_types: response })
        ),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'library-effects.get-sort-types.error.details'
            )
          });
          return of(new LibraryActions.LibraryGetScanTypesFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryActions.LibraryGetScanTypesFailed());
    })
  );

  @Effect()
  get_formats$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.GetFormats),
    switchMap(action =>
      this.library_service.get_formats().pipe(
        map(
          response =>
            new LibraryActions.LibraryGotFormats({ formats: response })
        ),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'library-effects.get-formats.error.details'
            )
          });
          return of(new LibraryActions.LibraryGetFormatsFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryActions.LibraryGetFormatsFailed());
    })
  );

  @Effect()
  get_updates$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.GetUpdates),
    map((action: LibraryActions.LibraryGetUpdates) => action.payload),
    switchMap(action =>
      this.library_service
        .get_updates(action.later_than, action.timeout, action.maximum)
        .pipe(
          map(
            (response: LibraryUpdateResponse) =>
              new LibraryActions.LibraryGotUpdates({
                comics: response.comics,
                last_read_dates: response.last_read_dates,
                pending_imports: response.pending_imports,
                pending_rescans: response.pending_rescans
              })
          ),
          catchError(error => {
            this.message_service.add({
              severity: 'error',
              detail: this.translate_service.instant(
                'library-effects.get-updates.error.detail'
              )
            });
            return of(new LibraryActions.LibraryGetUpdatesFailed());
          })
        )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryActions.LibraryGetUpdatesFailed());
    })
  );

  @Effect()
  start_rescan$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.StartRescan),
    switchMap(action =>
      this.library_service.start_rescan().pipe(
        tap(() =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
              'library-effects.start-rescan.success.detail'
            )
          })
        ),
        map(
          (response: StartRescanResponse) =>
            new LibraryActions.LibraryRescanStarted({ count: response.count })
        ),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'library-effects.start-rescan.error.detail'
            )
          });
          return of(new LibraryActions.LibraryStartRescanFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryActions.LibraryStartRescanFailed());
    })
  );

  @Effect()
  update_comic$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.UpdateComic),
    map((action: LibraryActions.LibraryUpdateComic) => action.payload),
    switchMap(action =>
      this.library_service.update_comic(action.comic).pipe(
        tap(response =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
              'library-effects.update-comic.success.detail'
            )
          })
        ),
        map(
          response =>
            new LibraryActions.LibraryComicUpdated({ comic: response })
        ),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'library-effects.update-comic.failure.detail'
            )
          });
          return of(new LibraryActions.LibraryUpdateComicFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryActions.LibraryUpdateComicFailed());
    })
  );

  @Effect()
  clear_metadata$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.ClearMetadata),
    map((action: LibraryActions.LibraryClearMetadata) => action.payload),
    switchMap(action =>
      this.library_service.clear_metadata(action.comic).pipe(
        tap(response =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
              'library-effects.clear-metadata.success.detail'
            )
          })
        ),
        map(
          reponse =>
            new LibraryActions.LibraryMetadataCleared({ comic: reponse })
        ),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'library-effects.clear-metadata.failure.detail'
            )
          });
          return of(new LibraryActions.LibraryClearMetadataFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryActions.LibraryClearMetadataFailed());
    })
  );

  @Effect()
  block_page_hash$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.BlockPageHash),
    map((action: LibraryActions.LibraryBlockPageHash) => action.payload),
    switchMap(action =>
      this.library_service
        .set_block_page_hash(action.hash, action.blocked)
        .pipe(
          tap((response: BlockedPageResponse) =>
            this.message_service.add({
              severity: 'info',
              detail: this.translate_service.instant(
                response.blocked
                  ? 'library-effects.block-page-page.success.blocked-detail'
                  : 'library-effects.block-page-hash.success.unblocked-detail',
                { hash: response.hash }
              )
            })
          ),
          map(
            (response: BlockedPageResponse) =>
              new LibraryActions.LibraryPageHashBlocked({
                hash: response.hash,
                blocked: response.blocked
              })
          ),
          catchError(error => {
            this.message_service.add({
              severity: 'error',
              detail: this.translate_service.instant(
                'library-effects.block-page-hash.failure.detail'
              )
            });
            return of(new LibraryActions.LibraryBlockPageHashFailed());
          })
        )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryActions.LibraryBlockPageHashFailed());
    })
  );

  @Effect()
  delete_multiple_comics$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActionTypes.DeleteMultipleComics),
    map((action: LibraryActions.LibraryDeleteMultipleComics) => action.payload),
    switchMap(action =>
      this.library_service.delete_multiple_comics(action.ids).pipe(
        tap((response: DeleteMultipleComicsResponse) =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
              'library-effects.delete-multiple-comics.success.detail',
              { count: response.count }
            )
          })
        ),
        map(
          (response: DeleteMultipleComicsResponse) =>
            new LibraryActions.LibraryMultipleComicsDeleted({
              count: response.count
            })
        ),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'library-effects.delete-multiple-comics.failure.detail'
            )
          });
          return of(new LibraryActions.LibraryDeleteMultipleComicsFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new LibraryActions.LibraryDeleteMultipleComicsFailed());
    })
  );
}
