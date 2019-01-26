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

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import * as ImportingActions from '../actions/importing.actions';
import {ComicService} from '../services/comic.service';
import {AlertService} from '../services/alert.service';
import {ComicFile} from '../models/import/comic-file';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class ImportingEffects {
  constructor(
    private actions$: Actions,
    private comic_service: ComicService,
    private alert_service: AlertService,
    private translate: TranslateService,
  ) {
  }

  @Effect()
  importing_fetch_files$: Observable<Action> = this.actions$.pipe(
    ofType(ImportingActions.IMPORTING_FETCH_FILES),
    map((action: ImportingActions.ImportingFetchFiles) => action.payload),
    switchMap(action => this.comic_service.get_files_under_directory(action.directory).pipe(
      tap((files: Array<ComicFile>) => this.alert_service.show_info_message(this.translate.instant("effects.importing.info.found_files", {file_count: files.length}))),
      map((files: Array<ComicFile>) => new ImportingActions.ImportingFilesFetched({
        files: files,
      })))));

  @Effect()
  importing_import_files$: Observable<Action> = this.actions$.pipe(
    ofType(ImportingActions.IMPORTING_IMPORT_FILES),
    map((action: ImportingActions.ImportingImportFiles) => action.payload),
    switchMap(action => this.comic_service.import_files_into_library(action.files, false).pipe(
      map(() => new ImportingActions.ImportingFilesAreImporting()))));
}
