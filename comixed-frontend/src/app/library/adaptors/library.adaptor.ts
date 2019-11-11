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
import { AppState } from 'app/library';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comic } from 'app/comics/models/comic';
import {
  LIBRARY_FEATURE_KEY,
  LibraryState
} from 'app/library/reducers/library.reducer';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { extractField } from 'app/library/utility.functions';
import { LastReadDate } from 'app/library/models/last-read-date';
import {
  LibraryDeleteMultipleComics,
  LibraryGetUpdates,
  LibraryReset,
  LibraryStartRescan
} from 'app/library/actions/library.actions';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { ComicGetIssue } from 'app/comics/actions/comic.actions';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';

@Injectable()
export class LibraryAdaptor {
  private _fetchingUpdate$ = new BehaviorSubject<boolean>(false);
  private _latestUpdatedDate$ = new BehaviorSubject<number>(0);
  private _comic$ = new BehaviorSubject<Comic[]>([]);
  private _lastReadDate$ = new BehaviorSubject<LastReadDate[]>([]);
  private _publisher$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _serie$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _character$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _team$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _location$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _stories$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _processingCount$ = new BehaviorSubject<number>(0);
  private _rescanCount$ = new BehaviorSubject<number>(0);
  private comicId = -1;
  private _timeout = 60;
  private _maximum = 100;

  constructor(
    private store: Store<AppState>,
    private comicAdaptor: ComicAdaptor
  ) {
    this.comicAdaptor.comic$.subscribe(
      comic => (this.comicId = !!comic ? comic.id : -1)
    );
    this.store
      .select(LIBRARY_FEATURE_KEY)
      .pipe(
        // ofType(LibraryActionTypes.UpdatesReceived),
        filter(state => {
          return !!state;
        })
      )
      .subscribe((libraryState: LibraryState) => {
        if (
          this._processingCount$.getValue() !== libraryState.processingCount
        ) {
          this._processingCount$.next(libraryState.processingCount);
        }
        if (this._rescanCount$.getValue() !== libraryState.rescanCount) {
          this._rescanCount$.next(libraryState.rescanCount);
        }
        if (
          this.comicId !== -1 &&
          libraryState.updatedIds.includes(this.comicId)
        ) {
          this.store.dispatch(new ComicGetIssue({ id: this.comicId }));
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
      });
  }

  get latestUpdatedDate$(): Observable<number> {
    return this._latestUpdatedDate$.asObservable();
  }

  getLibraryUpdates(): void {
    this.store.dispatch(
      new LibraryGetUpdates({
        timestamp: this._latestUpdatedDate$.getValue(),
        timeout: this._timeout,
        maximumResults: this._maximum,
        lastProcessingCount: this._processingCount$.getValue(),
        lastRescanCount: this._rescanCount$.getValue()
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

  resetLibrary(): void {
    this.store.dispatch(new LibraryReset());
  }

  startRescan(): void {
    this.store.dispatch(new LibraryStartRescan());
  }

  deleteComics(ids: number[]): void {
    this.store.dispatch(new LibraryDeleteMultipleComics({ ids: ids }));
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
