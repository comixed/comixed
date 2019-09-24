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
import { Comic } from 'app/comics/models/comic';
import { LibraryState } from 'app/library/models/library-state';
import { LIBRARY_FEATURE_KEY } from 'app/library/reducers/library.reducer';
import { ScanType } from 'app/comics/models/scan-type';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { ComicFormat } from 'app/comics/models/comic-format';
import * as LibraryActions from '../actions/library.actions';
import { extractField } from 'app/library/utility.functions';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { ofType } from '@ngrx/effects';
import {
  LibraryActionTypes,
  LibrarySetCurrentComic
} from '../actions/library.actions';
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
  _last_updated$ = new BehaviorSubject<Date>(new Date());

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
      .subscribe((libraryState: LibraryState) => {
        this._latest_updated_date = libraryState.latest_updated_date;
        this._pending_import$.next(libraryState.pending_imports);
        this._pending_rescan$.next(libraryState.pending_rescans);

        if (!_.isEqual(this._scan_type$.getValue(), libraryState.scan_types)) {
          this._scan_type$.next(libraryState.scan_types);
        }
        if (!_.isEqual(this._format$.getValue(), libraryState.formats)) {
          this._format$.next(libraryState.formats);
        }
        if (
          !_.isEqual(
            this._last_read_date$.getValue(),
            libraryState.last_read_dates
          )
        ) {
          this._last_read_date$.next(libraryState.last_read_dates);
        }
        this._fetching_update$.next(libraryState.fetching_updates);
        if (!_.isEqual(this._comic$.getValue(), libraryState.comics)) {
          this._comic$.next(libraryState.comics);
          this._publisher$.next(
            extractField(libraryState.comics, 'publisher')
          );
          this._serie$.next(extractField(libraryState.comics, 'series'));
          this._character$.next(
            extractField(libraryState.comics, 'characters')
          );
          this._team$.next(extractField(libraryState.comics, 'teams'));
          this._location$.next(extractField(libraryState.comics, 'locations'));
          this._story_arc$.next(
            extractField(libraryState.comics, 'storyArcs')
          );
          if (this.current_id !== -1) {
            this._current_comic$.next(
              libraryState.comics.find(comic => comic.id === this.current_id)
            );
          }
        }
        if (this.current_id !== -1 && libraryState.current_comic) {
          if (
            !_.isEqual(
              this._current_comic$.getValue(),
              libraryState.current_comic
            )
          ) {
            this._current_comic$.next(libraryState.current_comic);
          }
        }
        this._last_updated$.next(new Date());
      });
  }

  get last_updated$(): Observable<Date> {
    return this._last_updated$.asObservable();
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

  get fetching_update$(): Observable<boolean> {
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

  private get_comics_for_series(series: string): Comic[] {
    return this._serie$
      .getValue()
      .find(entry => entry.comics[0].series === series)
      .comics.sort((c1: Comic, c2: Comic) =>
        (c1.sortableIssueNumber || '0').localeCompare(
          c2.sortableIssueNumber || '0'
        )
      );
  }

  get_previous_issue(comic: Comic): Comic {
    const comics = this.get_comics_for_series(comic.series);
    const index = comics.findIndex(entry => entry.id === comic.id);

    return index > 0 ? comics[index - 1] : null;
  }

  get_next_issue(comic: Comic): Comic {
    const comics = this.get_comics_for_series(comic.series);
    const index = comics.findIndex(entry => entry.id === comic.id);

    return index < comics.length ? comics[index + 1] : null;
  }
}
