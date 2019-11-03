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
import { AppState, Comic } from 'app/comics';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';
import {
  ScrapingGetIssue,
  ScrapingGetVolumes,
  ScrapingLoadMetadata,
  ScrapingStart
} from 'app/comics/actions/scraping.actions';
import {
  SCRAPING_FEATURE_KEY,
  ScrapingState
} from 'app/comics/reducers/scraping.reducer';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';

@Injectable()
export class ScrapingAdaptor {
  private _comics$ = new BehaviorSubject<Comic[]>([]);
  private _comic$ = new BehaviorSubject<Comic>(null);
  private _fetchingVolumes$ = new BehaviorSubject<boolean>(false);
  private _volumes$ = new BehaviorSubject<ScrapingVolume[]>([]);
  private _fetchingIssue$ = new BehaviorSubject<boolean>(false);
  private _issue$ = new BehaviorSubject<ScrapingIssue>(null);
  private _scraping$ = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<AppState>) {
    this.store
      .select(SCRAPING_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: ScrapingState) => {
        if (!_.isEqual(this._comics$.getValue(), state.comics)) {
          this._comics$.next(state.comics);
        }
        if (!_.isEqual(this._comic$.getValue(), state.comic)) {
          this._comic$.next(state.comic);
        }
        if (this._fetchingVolumes$.getValue() !== state.fetchingVolumes) {
          this._fetchingVolumes$.next(state.fetchingVolumes);
        }
        if (!_.isEqual(this._volumes$.getValue(), state.volumes)) {
          this._volumes$.next(state.volumes);
        }
        if (this._fetchingIssue$.getValue() !== state.fetchingIssue) {
          this._fetchingIssue$.next(state.fetchingIssue);
        }
        if (!_.isEqual(this._issue$.getValue(), state.issue)) {
          this._issue$.next(state.issue);
        }
        if (this._scraping$.getValue() !== state.scraping) {
          this._scraping$.next(state.scraping);
        }
      });
  }

  startScraping(comics: Comic[]): void {
    this.store.dispatch(new ScrapingStart({ comics: comics }));
  }

  get comics$(): Observable<Comic[]> {
    return this._comics$.asObservable();
  }

  get comic$(): Observable<Comic> {
    return this._comic$.asObservable();
  }

  getVolumes(
    apiKey: string,
    series: string,
    volume: string,
    skipCache: boolean
  ): void {
    this.store.dispatch(
      new ScrapingGetVolumes({
        apiKey: apiKey,
        series: series,
        volume: volume,
        skipCache: skipCache
      })
    );
  }

  get fetchingVolumes$(): Observable<boolean> {
    return this._fetchingVolumes$.asObservable();
  }

  get volumes$(): Observable<ScrapingVolume[]> {
    return this._volumes$.asObservable();
  }

  getIssue(
    apiKey: string,
    volumeId: number,
    issueNumber: string,
    skipCache: boolean
  ): void {
    this.store.dispatch(
      new ScrapingGetIssue({
        apiKey: apiKey,
        volumeId: volumeId,
        issueNumber: issueNumber,
        skipCache: skipCache
      })
    );
  }

  get fetchingIssue$(): Observable<boolean> {
    return this._fetchingIssue$.asObservable();
  }

  get issue$(): Observable<ScrapingIssue> {
    return this._issue$.asObservable();
  }

  loadMetadata(
    apiKey: string,
    comicId: number,
    issueNumber: string,
    skipCache: boolean
  ): void {
    this.store.dispatch(
      new ScrapingLoadMetadata({
        apiKey: apiKey,
        comicId: comicId,
        issueNumber: issueNumber,
        skipCache: skipCache
      })
    );
  }

  get scraping$(): Observable<boolean> {
    return this._scraping$.asObservable();
  }
}
