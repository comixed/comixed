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
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import * as LibraryActions from '../actions/library.actions';
import { ComicService } from '../services/comic.service';
import { AlertService } from '../services/alert.service';
import { LibraryState } from '../models/library-state';
import { Comic } from '../models/comics/comic';
import { ScanType } from '../models/comics/scan-type';
import { ComicFormat } from '../models/comics/comic-format';

@Injectable()
export class LibraryEffects {
  constructor(
    private actions$: Actions,
    private comic_service: ComicService,
    private alert_service: AlertService,
  ) { }

  @Effect()
  library_get_scan_types$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryGetScanTypes>(LibraryActions.LIBRARY_GET_SCAN_TYPES)
    .switchMap(action =>
      this.comic_service.fetch_scan_types()
        .catch((error: Error) => of(this.alert_service.show_error_message('Error fetching scan types...', error)))
        .map((scan_types: Array<ScanType>) => new LibraryActions.LibrarySetScanTypes({ scan_types: scan_types })));

  @Effect()
  library_set_scan_type$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibrarySetScanType>(LibraryActions.LIBRARY_SET_SCAN_TYPE)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.set_scan_type(action.comic, action.scan_type)
        .do(() => this.alert_service.show_info_message(`Scan type set to ${action.scan_type.name}...`))
        .catch((error: Error) => of(this.alert_service.show_error_message('Error setting scan type...', error)))
        .map(() => new LibraryActions.LibraryScanTypeSet({
          comic: action.comic,
          scan_type: action.scan_type,
        })));

  @Effect()
  library_get_formats$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryGetFormats>(LibraryActions.LIBRARY_GET_FORMATS)
    .switchMap(action =>
      this.comic_service.fetch_formats()
        .catch((error: Error) => of(this.alert_service.show_error_message('Error fetching format types...', error)))
        .map((formats: Array<ComicFormat>) => new LibraryActions.LibrarySetFormats({ formats: formats })));

  @Effect()
  library_set_format$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibrarySetFormat>(LibraryActions.LIBRARY_SET_FORMAT)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.set_format(action.comic, action.format)
        .do(() => this.alert_service.show_info_message(`Format set to ${action.format.name}...`))
        .catch((error: Error) => of(this.alert_service.show_error_message('Error setting format...', error)))
        .map(() => new LibraryActions.LibraryFormatSet({
          comic: action.comic,
          format: action.format,
        })));

  @Effect()
  library_set_sort_name$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibrarySetSortName>(LibraryActions.LIBRARY_SET_SORT_NAME)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.set_sort_name(action.comic, action.sort_name)
        .do(() => this.alert_service.show_info_message(`Sort name set to ${action.sort_name}...`))
        .catch((error: Error) => of(this.alert_service.show_error_message('Error setting sort name...', error)))
        .map(() => new LibraryActions.LibrarySortNameSet({
          comic: action.comic,
          sort_name: action.sort_name,
        })));

  @Effect()
  library_start_updating$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryFetchLibraryChanges>(LibraryActions.LIBRARY_FETCH_LIBRARY_CHANGES)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.fetch_remote_library_state(action.last_comic_date)
        .catch((error: Error) => of(this.alert_service.show_error_message('Error getting library updates...', error)))
        .map((library_state: LibraryState) => new LibraryActions.LibraryMergeNewComics({
          comics: library_state.comics,
          rescan_count: library_state.rescan_count,
          import_count: library_state.import_count,
        })));

  @Effect()
  library_remove_comic$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryRemoveComic>(LibraryActions.LIBRARY_REMOVE_COMIC)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.delete_comic(action.comic)
        .do(() => this.alert_service.show_info_message(`Comic removed from library...`))
        .catch((error: Error) => of(this.alert_service.show_error_message('Error removing comic...', error)))
        .map(() => new LibraryActions.LibraryUpdateComicsRemoveComic({
          comic: action.comic,
        }))
    );

  @Effect()
  library_clear_metadata$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryClearMetadata>(LibraryActions.LIBRARY_CLEAR_METADATA)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.clear_metadata(action.comic)
        .do(() => this.alert_service.show_info_message('Metadata cleared...'))
        .catch((error: Error) => of(this.alert_service.show_error_message('Failed to clear metadata...', error)))
        .map((comic: Comic) => new LibraryActions.LibraryMetadataCleared({ comic: comic, })));

  @Effect()
  library_rescan_files$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryRescanFiles>(LibraryActions.LIBRARY_RESCAN_FILES)
    .switchMap(action =>
      this.comic_service.rescan_files()
        .do(() => this.alert_service.show_info_message('Library rescan started...'))
        .catch((error: Error) => of(this.alert_service.show_error_message('Failed to start rescanning...', error)))
        .map(() => new LibraryActions.LibraryFetchLibraryChanges({ last_comic_date: '0' })));
}
