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
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import * as LibraryActions from '../actions/library.actions';
import { ComicService } from '../services/comic.service';
import { Comic } from '../models/comics/comic';
import { ScanType } from '../models/comics/scan-type';

@Injectable()
export class LibraryEffects {
  constructor(
    private actions$: Actions,
    private comic_service: ComicService,
  ) { }

  @Effect()
  library_get_scan_types$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryGetScanTypes>(LibraryActions.LIBRARY_GET_SCAN_TYPES)
    .switchMap(action =>
      this.comic_service.fetch_scan_types()
        .map((scan_types: Array<ScanType>) => new LibraryActions.LibrarySetScanTypes({ scan_types: scan_types })));

  @Effect()
  library_set_scan_type$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibrarySetScanType>(LibraryActions.LIBRARY_SET_SCAN_TYPE)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.set_scan_type(action.comic, action.scan_type)
        .map(() => new LibraryActions.LibraryScanTypeSet({
          comic: action.comic,
          scan_type: action.scan_type,
        })));

  library_start_updating$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryFetchLibraryChanges>(LibraryActions.LIBRARY_FETCH_LIBRARY_CHANGES)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.fetch_remote_library_state(action.last_comic_date)
        .map((comics: Array<Comic>) => new LibraryActions.LibraryMergeNewComics({
          comics: comics,
        })));

  @Effect()
  library_remove_comic$: Observable<Action> = this.actions$
    .ofType<LibraryActions.LibraryRemoveComic>(LibraryActions.LIBRARY_REMOVE_COMIC)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.delete_comic(action.comic)
        .map(() => new LibraryActions.LibraryUpdateComicsRemoveComic({
          comic: action.comic,
        }))
    );
}
