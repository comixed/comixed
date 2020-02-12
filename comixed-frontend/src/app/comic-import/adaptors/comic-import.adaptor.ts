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
import { Store } from '@ngrx/store';
import { AppState } from 'app/comic-import';
import {
  COMIC_IMPORT_FEATURE_KEY,
  ComicImportState
} from 'app/comic-import/reducers/comic-import.reducer';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { ComicFile } from 'app/comic-import/models/comic-file';
import * as _ from 'lodash';
import {
  ComicImportDeselectFiles,
  ComicImportGetFiles,
  ComicImportReset,
  ComicImportSelectFiles,
  ComicImportSetDirectory,
  ComicImportStart
} from 'app/comic-import/actions/comic-import.actions';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class ComicImportAdaptor {
  private _directory$ = new BehaviorSubject<string>('');
  private _fetchingComicFile$ = new BehaviorSubject<boolean>(false);
  private _comicFile$ = new BehaviorSubject<ComicFile[]>([]);
  private _selectedComicFile$ = new BehaviorSubject<ComicFile[]>([]);
  private _startingImport$ = new BehaviorSubject<boolean>(false);

  constructor(private logger: NGXLogger, private store: Store<AppState>) {
    this.store
      .select(COMIC_IMPORT_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: ComicImportState) => {
        this.logger.debug('comic import state updated:', state);
        if (!_.isEqual(this._directory$.getValue(), state.directory)) {
          this._directory$.next(state.directory);
        }
        if (this._fetchingComicFile$.getValue() !== state.fetchingFiles) {
          this._fetchingComicFile$.next(state.fetchingFiles);
        }
        if (!_.isEqual(this._comicFile$.getValue(), state.comicFiles)) {
          this._comicFile$.next(state.comicFiles);
        }
        if (
          !_.isEqual(
            this._selectedComicFile$.getValue(),
            state.selectedComicFiles
          )
        ) {
          this._selectedComicFile$.next(state.selectedComicFiles);
        }
        if (this._startingImport$.getValue() !== state.startingImport) {
          this._startingImport$.next(state.startingImport);
        }
      });
  }

  setDirectory(directory: string) {
    this.store.dispatch(new ComicImportSetDirectory({ directory: directory }));
  }

  get directory$(): Observable<string> {
    return this._directory$.asObservable();
  }

  getComicFiles(directory: string) {
    this.store.dispatch(new ComicImportGetFiles({ directory: directory }));
  }

  get fetchingComicFile$(): Observable<boolean> {
    return this._fetchingComicFile$.asObservable();
  }

  get comicFile$(): Observable<ComicFile[]> {
    return this._comicFile$.asObservable();
  }

  get selectedComicFile$(): Observable<ComicFile[]> {
    return this._selectedComicFile$.asObservable();
  }

  selectComicFiles(comicFiles: ComicFile[]): void {
    this.logger.debug('firing action to select comic files:', comicFiles);
    this.store.dispatch(new ComicImportSelectFiles({ comicFiles: comicFiles }));
  }

  deselectComicFiles(comicFiles: ComicFile[]): void {
    this.logger.debug('firing action to deselect comic files:', comicFiles);
    this.store.dispatch(
      new ComicImportDeselectFiles({ comicFiles: comicFiles })
    );
  }

  clearSelectedComicFiles(): void {
    this.store.dispatch(new ComicImportReset());
  }

  startImport(
    comicFiles: ComicFile[],
    ignoreMetadata: boolean,
    deleteBlockedPages: boolean
  ) {
    this.store.dispatch(
      new ComicImportStart({
        comicFiles: comicFiles,
        ignoreMetadata: ignoreMetadata,
        deleteBlockedPages: deleteBlockedPages
      })
    );
  }

  get startingImport$(): Observable<boolean> {
    return this._startingImport$.asObservable();
  }
}
