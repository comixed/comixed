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
import {
  LibraryGetFormats,
  LibraryGetScanTypes
} from '../actions/library.actions';
import { extractField } from 'app/library/utility.functions';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { LastReadDate } from 'app/library/models/last-read-date';

@Injectable()
export class LibraryAdaptor {
  _fetchingScanType$ = new BehaviorSubject<boolean>(false);
  _scanType$ = new BehaviorSubject<ScanType[]>([]);
  _fetchingFormat$ = new BehaviorSubject<boolean>(false);
  _format$ = new BehaviorSubject<ComicFormat[]>([]);
  _fetchingUpdate$ = new BehaviorSubject<boolean>(false);
  _latestUpdatedDate$ = new BehaviorSubject<number>(0);
  _comic$ = new BehaviorSubject<Comic[]>([]);
  _lastReadDate$ = new BehaviorSubject<LastReadDate[]>([]);
  _publisher$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _serie$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _character$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _team$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _location$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _stories$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  _processingCount$ = new BehaviorSubject<number>(0);
  _rescanCount$ = new BehaviorSubject<number>(0);
  _currentComicId$ = new BehaviorSubject<number>(-1);
  _currentComic$ = new BehaviorSubject<Comic>(null);
  _lastUpdated$ = new BehaviorSubject<Date>(new Date());

  library_state$: Observable<LibraryState>;
  _timeout = 60;
  _maximum = 100;

  constructor(private store: Store<AppState>) {
    this.store
      .select(LIBRARY_FEATURE_KEY)
      .pipe(
        // ofType(LibraryActionTypes.UpdatesReceived),
        filter(state => {
          return !!state;
        })
      )
      .subscribe((libraryState: LibraryState) => {
        this._processingCount$.next(libraryState.processingCount);
        this._rescanCount$.next(libraryState.rescanCount);

        if (
          this._fetchingScanType$.getValue() !== libraryState.fetchingScanTypes
        ) {
          this._fetchingScanType$.next(libraryState.fetchingScanTypes);
        }
        if (!_.isEqual(this._scanType$.getValue(), libraryState.scanTypes)) {
          this._scanType$.next(libraryState.scanTypes);
        }
        if (libraryState.fetchingFormats !== this._fetchingFormat$.getValue()) {
          this._fetchingFormat$.next(libraryState.fetchingFormats);
        }
        if (!_.isEqual(this._format$.getValue(), libraryState.formats)) {
          this._format$.next(libraryState.formats);
        }
        if (
          !_.isEqual(
            this._latestUpdatedDate$.getValue(),
            libraryState.latestUpdatedDate
          )
        ) {
          this._latestUpdatedDate$.next(libraryState.latestUpdatedDate);
        }
        if (
          !_.isEqual(this._lastReadDate$.getValue(), libraryState.lastReadDates)
        ) {
          this._lastReadDate$.next(libraryState.lastReadDates);
        }
        this._fetchingUpdate$.next(libraryState.fetchingUpdates);
        if (!_.isEqual(this._comic$.getValue(), libraryState.comics)) {
          this._comic$.next(libraryState.comics);
          this._publisher$.next(extractField(libraryState.comics, 'publisher'));
          this._serie$.next(extractField(libraryState.comics, 'series'));
          this._character$.next(
            extractField(libraryState.comics, 'characters')
          );
          this._team$.next(extractField(libraryState.comics, 'teams'));
          this._location$.next(extractField(libraryState.comics, 'locations'));
          this._stories$.next(extractField(libraryState.comics, 'storyArcs'));
        }
        if (
          !_.isEqual(libraryState.currentComic, this._currentComic$.getValue())
        ) {
          this._currentComic$.next(libraryState.currentComic);
          if (libraryState.currentComic) {
            let id = -1;
            if (
              libraryState.currentComic.id !== this._currentComicId$.getValue()
            ) {
              id = libraryState.currentComic.id;
            }
            if (this._currentComicId$.getValue() !== id) {
              this._currentComicId$.next(id);
            }
          }
        }
        this._lastUpdated$.next(new Date());
      });
  }

  get lastUpdated$(): Observable<Date> {
    return this._lastUpdated$.asObservable();
  }

  getScanTypes(): void {
    this.store.dispatch(new LibraryGetScanTypes());
  }

  get fetchingScanType$(): Observable<boolean> {
    return this._fetchingScanType$.asObservable();
  }

  get scanType$(): Observable<ScanType[]> {
    return this._scanType$.asObservable();
  }

  getFormats(): void {
    this.store.dispatch(new LibraryGetFormats());
  }

  get fetchingFormat$(): Observable<boolean> {
    return this._fetchingFormat$.asObservable();
  }

  get format$(): Observable<ComicFormat[]> {
    return this._format$.asObservable();
  }

  get latestUpdatedDate$(): Observable<number> {
    return this._latestUpdatedDate$.asObservable();
  }

  getLibraryUpdates(): void {
    this.store.dispatch(
      new LibraryActions.LibraryGetUpdates({
        timestamp: this._latestUpdatedDate$.getValue(),
        timeout: this._timeout,
        maximumResults: this._maximum
      })
    );
  }

  get fetchingUpdate$(): Observable<boolean> {
    return this._fetchingUpdate$.asObservable();
  }

  get comic$(): Observable<Comic[]> {
    return this._comic$.asObservable();
  }

  get lastReadDate$(): Observable<LastReadDate[]> {
    return this._lastReadDate$.asObservable();
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

  get stories$(): Observable<ComicCollectionEntry[]> {
    return this._stories$.asObservable();
  }

  get processingCount$(): Observable<number> {
    return this._processingCount$.asObservable();
  }

  get rescanCount$(): Observable<number> {
    return this._rescanCount$.asObservable();
  }

  get comics(): Comic[] {
    return this._comic$.getValue();
  }

  resetLibrary(): void {
    this.store.dispatch(new LibraryActions.LibraryReset());
  }

  get currentComicId$(): Observable<number> {
    return this._currentComicId$.asObservable();
  }

  get currentComic$(): Observable<Comic> {
    return this._currentComic$.asObservable();
  }

  saveComic(comic: Comic): void {
    this.store.dispatch(
      new LibraryActions.LibraryUpdateComic({ comic: comic })
    );
  }

  startRescan(): void {
    this.store.dispatch(new LibraryActions.LibraryStartRescan());
  }

  clearMetadata(comic: Comic): void {
    this.store.dispatch(
      new LibraryActions.LibraryClearMetadata({ comic: comic })
    );
  }

  blockPageHash(hash: string): void {
    this.store.dispatch(
      new LibraryActions.LibraryBlockPageHash({ hash: hash, blocked: true })
    );
  }

  unblockPageHash(hash: string): void {
    this.store.dispatch(
      new LibraryActions.LibraryBlockPageHash({ hash: hash, blocked: false })
    );
  }

  deleteComics(ids: number[]): void {
    this.store.dispatch(
      new LibraryActions.LibraryDeleteMultipleComics({ ids: ids })
    );
  }

  getComic(id: number): void {
    this.store.dispatch(new LibraryActions.LibraryFindCurrentComic({ id: id }));
  }

  private getComicsForSeries(series: string): Comic[] {
    return this._serie$
      .getValue()
      .find(entry => entry.comics[0].series === series)
      .comics.sort((c1: Comic, c2: Comic) =>
        (c1.sortableIssueNumber || '0').localeCompare(
          c2.sortableIssueNumber || '0'
        )
      );
  }

  getPreviousIssue(comic: Comic): Comic {
    const comics = this.getComicsForSeries(comic.series);
    const index = comics.findIndex(entry => entry.id === comic.id);

    return index > 0 ? comics[index - 1] : null;
  }

  getNextIssue(comic: Comic): Comic {
    const comics = this.getComicsForSeries(comic.series);
    const index = comics.findIndex(entry => entry.id === comic.id);

    return index < comics.length ? comics[index + 1] : null;
  }
}
