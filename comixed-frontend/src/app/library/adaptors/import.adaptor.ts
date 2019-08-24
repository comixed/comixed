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
import { Store } from '@ngrx/store';
import { AppState, ComicFile } from 'app/library';
import { IMPORT_FEATURE_KEY } from 'app/library/reducers/import.reducer';
import { filter } from 'rxjs/operators';
import { ImportState } from 'app/library/models/import-state';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import {
  ImportAddComicFiles,
  ImportGetFiles,
  ImportRemoveComicFiles,
  ImportSetDirectory,
  ImportStart
} from 'app/library/actions/import.actions';

@Injectable()
export class ImportAdaptor {
  _updated$ = new BehaviorSubject<Date>(new Date());
  _directory$ = new BehaviorSubject<string>('');
  _fetching_files$ = new BehaviorSubject<boolean>(false);
  _comic_file$ = new BehaviorSubject<ComicFile[]>([]);
  _selected_comic_file$ = new BehaviorSubject<ComicFile[]>([]);
  _starting_import$ = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<AppState>) {
    this.store
      .select(IMPORT_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((import_state: ImportState) => {
        if (!_.isEqual(this._directory$.getValue(), import_state.directory)) {
          this._directory$.next(import_state.directory);
        }
        if (
          !_.isEqual(
            this._fetching_files$.getValue(),
            import_state.fetching_files
          )
        ) {
          this._fetching_files$.next(import_state.fetching_files);
        }
        if (
          !_.isEqual(this._comic_file$.getValue(), import_state.comic_files)
        ) {
          this._comic_file$.next(import_state.comic_files);
        }
        if (
          !_.isEqual(
            this._selected_comic_file$.getValue(),
            import_state.selected_comic_files
          )
        ) {
          this._selected_comic_file$.next(import_state.selected_comic_files);
        }
        if (
          !_.isEqual(
            this._starting_import$.getValue(),
            import_state.starting_import
          )
        ) {
          this._starting_import$.next(import_state.starting_import);
        }
        this._updated$.next(new Date());
      });
  }

  get updated$(): Observable<Date> {
    return this._updated$.asObservable();
  }

  get directory$(): Observable<string> {
    return this._directory$.asObservable();
  }

  set_directory(directory: string): void {
    this.store.dispatch(new ImportSetDirectory({ directory: directory }));
  }

  get fetching_files$(): Observable<boolean> {
    return this._fetching_files$.asObservable();
  }

  get comic_file$(): Observable<ComicFile[]> {
    return this._comic_file$.asObservable();
  }

  fetch_files(directory: string): void {
    this.store.dispatch(new ImportGetFiles({ directory: directory }));
  }

  select_comic_files(comic_files: ComicFile[]): void {
    this.store.dispatch(new ImportAddComicFiles({ comic_files: comic_files }));
  }

  unselect_comic_files(comic_files: ComicFile[]): void {
    this.store.dispatch(
      new ImportRemoveComicFiles({ comic_files: comic_files })
    );
  }

  get selected_comic_file$(): Observable<ComicFile[]> {
    return this._selected_comic_file$.asObservable();
  }

  start_importing(
    delete_blocked_pages: boolean,
    ignore_metadata: boolean
  ): void {
    this.store.dispatch(
      new ImportStart({
        comic_files: this._selected_comic_file$.getValue(),
        delete_blocked_pages: delete_blocked_pages,
        ignore_metadata: ignore_metadata
      })
    );
  }

  get starting_import$(): Observable<boolean> {
    return this._starting_import$.asObservable();
  }
}
