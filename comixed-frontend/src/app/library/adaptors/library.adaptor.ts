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
  LibraryConsolidate,
  LibraryConvertComics,
  LibraryDeleteMultipleComics,
  LibraryDisplayComics,
  LibraryGetUpdates,
  LibraryReset,
  LibraryStartRescan
} from 'app/library/actions/library.actions';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { ComicGetIssue } from 'app/comics/actions/comic.actions';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { LoggerService } from '@angular-ru/logger';
import { CollectionType } from 'app/library/models/collection-type.enum';

@Injectable()
export class LibraryAdaptor {
  private _fetchingUpdate$ = new BehaviorSubject<boolean>(false);
  private _latestUpdatedDate$ = new BehaviorSubject<Date>(new Date(0));
  private _comic$ = new BehaviorSubject<Comic[]>([]);
  private _lastComicId$ = new BehaviorSubject<number>(0);
  private _lastReadDate$ = new BehaviorSubject<LastReadDate[]>([]);
  private _comicCount$ = new BehaviorSubject<number>(0);
  private _publishers$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _series$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _characters$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _teams$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _locations$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _stories$ = new BehaviorSubject<ComicCollectionEntry[]>([]);
  private _processingCount$ = new BehaviorSubject<number>(0);
  private comicId = -1;
  private _timeout = 60;
  private _maximum = 100;
  private _converting$ = new BehaviorSubject<boolean>(false);
  private _consolidating$ = new BehaviorSubject<boolean>(false);
  private _displayTitle$ = new BehaviorSubject<string>('');
  private _displayComics$ = new BehaviorSubject<Comic[]>(null);

  constructor(
    private store: Store<AppState>,
    private comicAdaptor: ComicAdaptor,
    private logger: LoggerService
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
          this._publishers$.next(
            extractField(
              state.comics,
              CollectionType.PUBLISHERS,
              'publisher',
              'imprint'
            )
          );
          this._series$.next(
            extractField(state.comics, CollectionType.SERIES, 'series')
          );
          this._characters$.next(
            extractField(state.comics, CollectionType.CHARACTERS, 'characters')
          );
          this._teams$.next(
            extractField(state.comics, CollectionType.TEAMS, 'teams')
          );
          this._locations$.next(
            extractField(state.comics, CollectionType.LOCATIONS, 'locations')
          );
          this._stories$.next(
            extractField(state.comics, CollectionType.STORIES, 'storyArcs')
          );
        }
        if (
          !!state.lastComicId &&
          this._lastComicId$.getValue() !== state.lastComicId
        ) {
          this._lastComicId$.next(state.lastComicId);
        }
        if (state.convertingComics !== this._converting$.getValue()) {
          this._converting$.next(state.convertingComics);
        }
        if (state.consolidating !== this._consolidating$.getValue()) {
          this._consolidating$.next(state.consolidating);
        }
        if (state.displayTitle !== this._displayTitle$.getValue()) {
          this._displayTitle$.next(state.displayTitle);
        }
        if (!_.isEqual(state.displayComics, this._displayComics$.getValue())) {
          this._displayComics$.next(state.displayComics);
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

  get publishers$(): Observable<ComicCollectionEntry[]> {
    return this._publishers$.asObservable();
  }

  get series$(): Observable<ComicCollectionEntry[]> {
    return this._series$.asObservable();
  }

  get characters$(): Observable<ComicCollectionEntry[]> {
    return this._characters$.asObservable();
  }

  get teams$(): Observable<ComicCollectionEntry[]> {
    return this._teams$.asObservable();
  }

  get locations$(): Observable<ComicCollectionEntry[]> {
    return this._locations$.asObservable();
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
    return this._series$
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

  convertComics(comics: Comic[], archiveType: string, renamePages: boolean) {
    this.logger.debug(
      'firing action to convert comics:',
      comics,
      archiveType,
      renamePages
    );
    this.store.dispatch(
      new LibraryConvertComics({
        comics: comics,
        archiveType: archiveType,
        renamePages: renamePages
      })
    );
  }

  get converting$(): Observable<boolean> {
    return this._converting$.asObservable();
  }

  consolidate(deletePhysicalFiles: boolean): void {
    this.logger.debug(
      `firing action to consolidate library: deletePhysicalFiles=${deletePhysicalFiles}`
    );
    this.store.dispatch(
      new LibraryConsolidate({ deletePhysicalFiles: deletePhysicalFiles })
    );
  }

  get consolidating$(): Observable<boolean> {
    return this._consolidating$.asObservable();
  }

  displayComics(comics: Comic[], title: string) {
    this.logger.debug(
      'firing action to update displayed comics:',
      comics,
      title
    );
    this.store.dispatch(
      new LibraryDisplayComics({ comics: comics, title: title })
    );
  }

  get displayTitle$(): Observable<string> {
    return this._displayTitle$.asObservable();
  }

  get displayComics$(): Observable<Comic[]> {
    return this._displayComics$.asObservable();
  }
}
