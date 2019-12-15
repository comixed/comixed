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
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class LibraryAdaptor {
  private _fetchingUpdate$ = new BehaviorSubject<boolean>(false);
  private _latestUpdatedDate$ = new BehaviorSubject<Date>(new Date(0));
  private _comic$ = new BehaviorSubject<Comic[]>([]);
  private _lastComicId$ = new BehaviorSubject<number>(0);
  private _lastReadDate$ = new BehaviorSubject<LastReadDate[]>([]);
  private _comicCount$ = new BehaviorSubject<number>(0);
  private _publisher$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _serie$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _character$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _team$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _location$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _stories$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _processingCount$ = new BehaviorSubject<number>(0);
  private comicId = -1;
  private _timeout = 60;
  private _maximum = 100;

  constructor(
    private store: Store<AppState>,
    private comicAdaptor: ComicAdaptor,
    private logger: NGXLogger
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
      .subscribe((state: LibraryState) => {
        this.logger.debug('library state updated:', state);
        if (this._processingCount$.getValue() !== state.processingCount) {
          this._processingCount$.next(state.processingCount);
        }
        if (this.comicId !== -1 && state.updatedIds.includes(this.comicId)) {
          this.store.dispatch(new ComicGetIssue({ id: this.comicId }));
        }
        if (
          !_.isEqual(
            this._latestUpdatedDate$.getValue(),
            state.latestUpdatedDate
          )
        ) {
          this._latestUpdatedDate$.next(state.latestUpdatedDate);
        }
        if (!_.isEqual(this._lastReadDate$.getValue(), state.lastReadDates)) {
          this._lastReadDate$.next(state.lastReadDates);
        }
        if (this._comicCount$.getValue() !== state.comicCount) {
          this._comicCount$.next(state.comicCount);
        }
        this._fetchingUpdate$.next(state.fetchingUpdates);
        if (!_.isEqual(this._comic$.getValue(), state.comics)) {
          this._comic$.next(state.comics);
          this._publisher$.next(extractField(state.comics, 'publisher'));
          this._serie$.next(extractField(state.comics, 'series'));
          this._character$.next(extractField(state.comics, 'characters'));
          this._team$.next(extractField(state.comics, 'teams'));
          this._location$.next(extractField(state.comics, 'locations'));
          this._stories$.next(extractField(state.comics, 'storyArcs'));
        }
        if (
          !!state.lastComicId &&
          this._lastComicId$.getValue() !== state.lastComicId
        ) {
          this._lastComicId$.next(state.lastComicId);
        }
      });
  }

  get latestUpdatedDate$(): Observable<Date> {
    return this._latestUpdatedDate$.asObservable();
  }

  getLibraryUpdates(): void {
    this.logger.debug('firing action to get library updates');
    this.store.dispatch(
      new LibraryGetUpdates({
        lastUpdateDate: this._latestUpdatedDate$.getValue(),
        maximumComics: this._maximum,
        lastComicId: this._lastComicId$.getValue(),
        processingCount: this._processingCount$.getValue(),
        timeout: this._timeout
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

  get comicCount$(): Observable<number> {
    return this._comicCount$.asObservable();
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
    this.logger.debug('getting comics for series:', series);
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
    this.logger.debug('getting previous issue for comic:', comic);
    const comics = this.getComicsForSeries(comic.series);
    const index = comics.findIndex(entry => entry.id === comic.id);

    return index > 0 ? comics[index - 1] : null;
  }

  getNextIssue(comic: Comic): Comic {
    this.logger.debug('getting next issue for comic:', comic);
    const comics = this.getComicsForSeries(comic.series);
    const index = comics.findIndex(entry => entry.id === comic.id);

    return index < comics.length ? comics[index + 1] : null;
  }
}
