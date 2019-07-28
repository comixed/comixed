/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as LibraryActions from 'app/actions/library.actions';
import { MessageService } from 'primeng/api';
import { ComicService } from 'app/services/comic.service';
import { LibraryContents } from 'app/models/library-contents';
import { Comic } from 'app/models/comics/comic';
import { ScanType } from 'app/models/comics/scan-type';
import { ComicFormat } from 'app/models/comics/comic-format';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LibraryEffects {
  constructor(
    private actions$: Actions,
    private message_service: MessageService,
    private comic_service: ComicService,
    private translate: TranslateService
  ) {}

  @Effect()
  library_get_scan_types$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_GET_SCAN_TYPES),
    switchMap(action =>
      this.comic_service.fetch_scan_types().pipe(
        catchError((error: Error) =>
          of(
            this.message_service.add({
              severity: 'error',
              summary: 'Scan Type',
              detail: this.translate.instant(
                'effects.library.error.scan-type-fetch-failure'
              )
            })
          )
        ),
        map(
          (scan_types: Array<ScanType>) =>
            new LibraryActions.LibrarySetScanTypes({ scan_types: scan_types })
        )
      )
    )
  );

  @Effect()
  library_set_scan_type$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_SET_SCAN_TYPE),
    map((action: LibraryActions.LibrarySetScanType) => action.payload),
    switchMap(action =>
      this.comic_service.set_scan_type(action.comic, action.scan_type).pipe(
        tap(() =>
          this.message_service.add({
            severity: 'info',
            summary: 'Scan Type',
            detail: this.translate.instant(
              'effects.library.info.scan-type-set',
              {
                scan_type: action.scan_type.name
              }
            )
          })
        ),
        catchError((error: Error) =>
          of(
            this.message_service.add({
              severity: 'error',
              summary: 'Scan Type',
              detail: this.translate.instant(
                'effects.library.error.set-scan-type-failed'
              )
            })
          )
        ),
        map(
          () =>
            new LibraryActions.LibraryScanTypeSet({
              comic: action.comic,
              scan_type: action.scan_type
            })
        )
      )
    )
  );

  @Effect()
  library_get_formats$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_GET_FORMATS),
    switchMap((action: LibraryActions.LibraryGetFormats) =>
      this.comic_service.fetch_formats().pipe(
        catchError((error: Error) =>
          of(
            this.message_service.add({
              severity: 'error',
              summary: 'Format Type',
              detail: this.translate.instant(
                'effects.library.error.format-type-fetch-failure'
              )
            })
          )
        ),
        map(
          (formats: Array<ComicFormat>) =>
            new LibraryActions.LibrarySetFormats({ formats: formats })
        )
      )
    )
  );

  @Effect()
  library_set_format$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_SET_FORMAT),
    map((action: LibraryActions.LibrarySetFormat) => action.payload),
    switchMap(action =>
      this.comic_service.set_format(action.comic, action.format).pipe(
        tap(() =>
          this.message_service.add({
            severity: 'info',
            summary: 'Format Type',
            detail: this.translate.instant(
              'effects.library.info.format-type-set',
              {
                format_type: action.format.name
              }
            )
          })
        ),
        catchError((error: Error) =>
          of(
            this.message_service.add({
              severity: 'error',
              summary: 'Format Type',
              detail: this.translate.instant(
                'effects.library.error.set-format-type-failed'
              )
            })
          )
        ),
        map(
          () =>
            new LibraryActions.LibraryFormatSet({
              comic: action.comic,
              format: action.format
            })
        )
      )
    )
  );

  @Effect()
  library_set_sort_name$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_SET_SORT_NAME),
    map((action: LibraryActions.LibrarySetSortName) => action.payload),
    switchMap(action =>
      this.comic_service.set_sort_name(action.comic, action.sort_name).pipe(
        tap(() =>
          this.message_service.add({
            severity: 'info',
            summary: 'Sort Name',
            detail: this.translate.instant(
              'effects.library.info.sort-name-set',
              {
                sort_name: action.sort_name
              }
            )
          })
        ),
        catchError((error: Error) =>
          of(
            this.message_service.add({
              severity: 'error',
              summary: 'Sort Name',
              detail: this.translate.instant(
                'effects.library.error.set-sort-name-failed'
              )
            })
          )
        ),
        map(
          () =>
            new LibraryActions.LibrarySortNameSet({
              comic: action.comic,
              sort_name: action.sort_name
            })
        )
      )
    )
  );

  @Effect()
  library_start_updating$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_FETCH_LIBRARY_CHANGES),
    map((action: LibraryActions.LibraryFetchLibraryChanges) => action.payload),
    switchMap(action =>
      this.comic_service
        .fetch_remote_library_state(action.last_comic_date, action.timeout)
        .pipe(
          catchError((error: Error) =>
            of(
              this.message_service.add({
                severity: 'error',
                summary: 'Update Library',
                detail: this.translate.instant(
                  'effects.library.error.library-update-failed'
                )
              })
            )
          ),
          map(
            (library_state: LibraryContents) =>
              new LibraryActions.LibraryMergeNewComics({
                library_state: library_state
              })
          )
        )
    )
  );

  @Effect()
  library_remove_comic$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_REMOVE_COMIC),
    map((action: LibraryActions.LibraryRemoveComic) => action.payload),
    switchMap(action =>
      this.comic_service.delete_comic(action.comic).pipe(
        tap(() =>
          this.message_service.add({
            severity: 'info',
            summary: 'Delete Comic',
            detail: this.translate.instant('effects.library.info.comic-removed')
          })
        ),
        catchError((error: Error) =>
          of(
            this.message_service.add({
              severity: 'error',
              summary: 'Delete Comic',
              detail: this.translate.instant(
                'effects.library.error.comic-remove-failed'
              )
            })
          )
        ),
        map(
          () =>
            new LibraryActions.LibraryUpdateComicsRemoveComic({
              comic: action.comic
            })
        )
      )
    )
  );

  @Effect()
  library_clear_metadata$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_CLEAR_METADATA),
    map((action: LibraryActions.LibraryClearMetadata) => action.payload),
    switchMap(action =>
      this.comic_service.clear_metadata(action.comic).pipe(
        tap(() =>
          this.message_service.add({
            severity: 'info',
            summary: 'Clear Metadata',
            detail: this.translate.instant(
              'effects.library.info.metadata-cleared'
            )
          })
        ),
        tap((comic: Comic) => {
          // clear all existing metadata and copy the new metadata
          for (const field of Object.keys(action.comic)) {
            delete action.comic[field];
          }

          Object.assign(action.comic, comic);
        }),
        catchError((error: Error) =>
          of(
            this.message_service.add({
              severity: 'error',
              summary: 'Clear Metadata',
              detail: this.translate.instant(
                'effects.library.error.metadata-clear-failed'
              )
            })
          )
        ),
        map(
          (comic: Comic) =>
            new LibraryActions.LibraryMetadataChanged({
              original: action.comic,
              updated: comic
            })
        )
      )
    )
  );

  @Effect()
  library_rescan_files$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_RESCAN_FILES),
    map((action: LibraryActions.LibraryRescanFiles) => action.payload),
    switchMap(action =>
      this.comic_service.rescan_files().pipe(
        tap(() =>
          this.message_service.add({
            severity: 'info',
            summary: 'Rescan Library',
            detail: this.translate.instant(
              'effects.library.info.rescan-started'
            )
          })
        ),
        catchError((error: Error) =>
          of(
            this.message_service.add({
              severity: 'error',
              summary: 'Rescan Library',
              detail: this.translate.instant(
                'effects.library.error.rescan-failed-to-start'
              )
            })
          )
        ),
        map(
          () =>
            new LibraryActions.LibraryFetchLibraryChanges({
              last_comic_date: action.last_comic_date,
              timeout: 60000
            })
        )
      )
    )
  );

  @Effect()
  library_set_page_blocked_state$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_SET_BLOCKED_PAGE_STATE),
    map((action: LibraryActions.LibrarySetBlockedPageState) => action.payload),
    switchMap(action =>
      this.comic_service
        .set_block_page(action.page.hash, action.blocked_state)
        .pipe(
          catchError((error: Error) =>
            of(
              this.message_service.add({
                severity: 'error',
                summary: 'Block Page',
                detail: this.translate.instant(
                  'effects.library.error.set-blocked-failed'
                )
              })
            )
          ),
          map(
            () =>
              new LibraryActions.LibraryBlockedStateFlagSet({
                page: action.page,
                blocked_state: action.blocked_state
              })
          )
        )
    )
  );

  @Effect()
  library_delete_multiple_comics$: Observable<Action> = this.actions$.pipe(
    ofType(LibraryActions.LIBRARY_DELETE_MULTIPLE_COMICS),
    map((action: LibraryActions.LibraryDeleteMultipleComics) => action.payload),
    switchMap(action =>
      this.comic_service
        .delete_multiple_comics(action.comics)
        .pipe(
          map(
            () =>
              new LibraryActions.LibraryComicsDeleted({ comics: action.comics })
          )
        )
    )
  );
}
