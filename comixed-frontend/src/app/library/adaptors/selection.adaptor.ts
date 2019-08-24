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
import { BehaviorSubject, Observable } from 'rxjs';
import { Comic, ComicFile } from 'app/library';
import { Store } from '@ngrx/store';
import { AppState } from 'app/library';
import { SELECTION_FEATURE_KEY } from 'app/library/reducers/selection.reducer';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';
import * as SelectActions from 'app/library/actions/selection.actions';
import {
  SelectAddComic,
  SelectAddComicFile,
  SelectBulkAddComicFiles,
  SelectBulkAddComics,
  SelectBulkRemoveComicFiles,
  SelectRemoveAllComicFiles,
  SelectRemoveAllComics,
  SelectBulkRemoveComics,
  SelectRemoveComic,
  SelectRemoveComicFile
} from 'app/library/actions/selection.actions';
import { SelectionState } from 'app/library/models/selection-state';

@Injectable()
export class SelectionAdaptor {
  _comic_selection$ = new BehaviorSubject<Comic[]>([]);
  _comic_file_selection$ = new BehaviorSubject<ComicFile[]>([]);

  constructor(private store: Store<AppState>) {
    this.store
      .select(SELECTION_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe(selection_state => this.update_state(selection_state));
  }

  update_state(selection_state: SelectionState) {
    if (!_.isEqual(this._comic_selection$.getValue(), selection_state.comics)) {
      this._comic_selection$.next(selection_state.comics);
    }
    if (
      !_.isEqual(
        this._comic_file_selection$.getValue(),
        selection_state.comic_files
      )
    ) {
      this._comic_file_selection$.next(selection_state.comic_files);
    }
  }

  get comic_selection$(): Observable<Comic[]> {
    return this._comic_selection$.asObservable();
  }

  select_comic(comic: Comic): void {
    this.store.dispatch(new SelectAddComic({ comic: comic }));
  }

  select_comics(comics: Comic[]): void {
    this.store.dispatch(new SelectBulkAddComics({ comics: comics }));
  }

  deselect_comic(comic: Comic): void {
    this.store.dispatch(new SelectRemoveComic({ comic: comic }));
  }

  deselect_comics(comics: Comic[]): void {
    this.store.dispatch(new SelectBulkRemoveComics({ comics: comics }));
  }

  deselect_all_comics(): void {
    this.store.dispatch(new SelectRemoveAllComics());
  }

  get comic_file_selection$(): Observable<ComicFile[]> {
    return this._comic_file_selection$.asObservable();
  }

  select_comic_file(comic_file: ComicFile): void {
    this.store.dispatch(new SelectAddComicFile({ comic_file: comic_file }));
  }

  select_comic_files(comic_files: ComicFile[]): void {
    this.store.dispatch(
      new SelectBulkAddComicFiles({ comic_files: comic_files })
    );
  }

  deselect_comic_file(comic_file: ComicFile): void {
    this.store.dispatch(new SelectRemoveComicFile({ comic_file: comic_file }));
  }

  deselect_comic_files(comic_files: ComicFile[]): void {
    this.store.dispatch(
      new SelectBulkRemoveComicFiles({ comic_files: comic_files })
    );
  }

  deselect_all_comic_files(): void {
    this.store.dispatch(new SelectRemoveAllComicFiles());
  }
}
