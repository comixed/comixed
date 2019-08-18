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
import { AppState } from 'app/library';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comic } from 'app/library/models/comic';
import { LibraryState } from 'app/library/models/library-state';
import { LIBRARY_FEATURE_KEY } from 'app/library/reducers/library.reducer';
import { ScanType } from 'app/library/models/scan-type';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { ComicFormat } from 'app/library/models/comic-format';
import * as LibraryActions from '../actions/library.actions';
import { extractField } from 'app/library/utility.functions';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { ofType } from '@ngrx/effects';
import { LibraryActionTypes } from '../actions/library.actions';
import { LastReadDate } from 'app/library/models/last-read-date';

@Injectable()
export class LibraryAdaptor {
  _scan_type$ = new BehaviorSubject<ScanType[]>([]);
  _format$ = new BehaviorSubject<ComicFormat[]>([]);
  _fetching_update$ = new BehaviorSubject<boolean>(false);
  _comic$ = new BehaviorSubject<Comic[]>([]);
  _last_read_date$ = new BehaviorSubject<LastReadDate[]>([]);
  _publisher$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _serie$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _character$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _team$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _location$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _story_arc$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _pending_import$ = new BehaviorSubject<number>(0);
  _pending_rescan$ = new BehaviorSubject<number>(0);
  _current_comic$ = new BehaviorSubject<Comic>(null);
  current_id = -1;
  _last_update$ = new BehaviorSubject<Date>(new Date());

  private library_state$: Observable<LibraryState>;
  _latest_updated_date = 0;
  _timeout = 60;
  _maximum = 100;

  constructor(private store: Store<AppState>) {
    this.store
      .select(LIBRARY_FEATURE_KEY)
      .pipe(
        // ofType(LibraryActionTypes.GotUpdates),
        filter(state => {
          return !!state;
        })
      )
      .subscribe((library_state: LibraryState) => {
        this._latest_updated_date = library_state.latest_updated_date;
        this._pending_import$.next(library_state.pending_imports);
        this._pending_rescan$.next(library_state.pending_rescans);

        if (!_.isEqual(this._scan_type$.getValue(), library_state.scan_types)) {
          this._scan_type$.next(library_state.scan_types);
        }
        if (!_.isEqual(this._format$.getValue(), library_state.formats)) {
          this._format$.next(library_state.formats);
        }
        if (
          !_.isEqual(
            this._last_read_date$.getValue(),
            library_state.last_read_dates
          )
        ) {
          this._last_read_date$.next(library_state.last_read_dates);
        }
        this._fetching_update$.next(library_state.fetching_updates);
        if (!_.isEqual(this._comic$.getValue(), library_state.comics)) {
          this._comic$.next(library_state.comics);
          this._publisher$.next(
            extractField(library_state.comics, 'publisher')
          );
          this._serie$.next(extractField(library_state.comics, 'series'));
          this._character$.next(
            extractField(library_state.comics, 'characters')
          );
          this._team$.next(extractField(library_state.comics, 'teams'));
          this._location$.next(extractField(library_state.comics, 'locations'));
          this._story_arc$.next(
            extractField(library_state.comics, 'story_arcs')
          );
          if (this.current_id !== -1) {
            this._current_comic$.next(
              library_state.comics.find(comic => comic.id === this.current_id)
            );
          }
        }
        if (this.current_id !== -1 && library_state.current_comic) {
          if (
            !_.isEqual(
              this._current_comic$.getValue(),
              library_state.current_comic
            )
          ) {
            this._current_comic$.next(library_state.current_comic);
          }
        }
        this._last_update$.next(new Date());
      });
  }

  get last_update$(): Observable<Date> {
    return this._last_update$.asObservable();
  }

  get scan_type$(): Observable<ScanType[]> {
    return this._scan_type$.asObservable();
  }

  get scan_types(): ScanType[] {
    return this._scan_type$.getValue();
  }

  get format$(): Observable<ComicFormat[]> {
    return this._format$.asObservable();
  }

  get formats(): ComicFormat[] {
    return this._format$.getValue();
  }

  get fetch_update$(): Observable<boolean> {
    return this._fetching_update$.asObservable();
  }

  get comic$(): Observable<Comic[]> {
    return this._comic$.asObservable();
  }

  get last_read_date$(): Observable<LastReadDate[]> {
    return this._last_read_date$.asObservable();
  }

  get publisher$(): Observable<ComicCollectionEntry[]> {
    return this._publisher$.asObservable();
  }

  get serie$(): Observable<ComicCollectionEntry[]> {
    return this._serie$.asObservable();
  }

  get character$(): Observable<ComicCollectionEntry[]> {
    return this._character$.asObservable();
  }

  get team$(): Observable<ComicCollectionEntry[]> {
    return this._team$.asObservable();
  }

  get location$(): Observable<ComicCollectionEntry[]> {
    return this._location$.asObservable();
  }

  get story_arc$(): Observable<ComicCollectionEntry[]> {
    return this._story_arc$.asObservable();
  }

  get pending_import$(): Observable<number> {
    return this._pending_import$.asObservable();
  }

  get pending_rescan$(): Observable<number> {
    return this._pending_rescan$.asObservable();
  }

  get comics(): Comic[] {
    return this._comic$.getValue();
  }

  reset_library(): void {
    this.store.dispatch(new LibraryActions.LibraryResetLibrary());
  }

  get_comic_updates(): void {
    this.store.dispatch(
      new LibraryActions.LibraryGetUpdates({
        later_than: this._latest_updated_date,
        timeout: this._timeout,
        maximum: this._maximum
      })
    );
  }

  get current_comic$(): Observable<Comic> {
    return this._current_comic$.asObservable();
  }

  set current_comic(comic: Comic) {
    this.store.dispatch(
      new LibraryActions.LibrarySetCurrentComic({ comic: comic })
    );
  }

  get current_comic(): Comic {
    return this._current_comic$.getValue();
  }

  save_comic(comic: Comic): void {
    this.store.dispatch(
      new LibraryActions.LibraryUpdateComic({ comic: comic })
    );
  }

  start_rescan(): void {
    this.store.dispatch(new LibraryActions.LibraryStartRescan());
  }

  clear_metadata(comic: Comic): void {
    this.store.dispatch(
      new LibraryActions.LibraryClearMetadata({ comic: comic })
    );
  }

  block_page_hash(hash: string): void {
    this.store.dispatch(
      new LibraryActions.LibraryBlockPageHash({ hash: hash, blocked: true })
    );
  }

  unblock_page_hash(hash: string): void {
    this.store.dispatch(
      new LibraryActions.LibraryBlockPageHash({ hash: hash, blocked: false })
    );
  }

  delete_comics_by_id(ids: number[]): void {
    this.store.dispatch(
      new LibraryActions.LibraryDeleteMultipleComics({ ids: ids })
    );
  }

  get_comic_by_id(id: number): void {
    this.current_id = id;
    this.store.dispatch(new LibraryActions.LibraryFindCurrentComic({ id: id }));
  }
}
