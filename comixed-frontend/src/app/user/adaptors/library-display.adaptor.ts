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
import { AuthenticationAdaptor, User } from 'app/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as _ from 'lodash';
import { LoggerService } from '@angular-ru/logger';

export const LIBRARY_DISPLAY_LAYOUT = 'library_display_layout';
export const LIBRARY_DISPLAY_LAYOUT_DEFAULT = 'grid';
export const LIBRARY_DISPLAY_SORT_FIELD = 'library_display_sort_field';
export const LIBRARY_DISPLAY_SORT_FIELD_DEFAULT = 'added_date';
export const LIBRARY_DISPLAY_ROWS = 'library_display_rows';
export const LIBRARY_DISPLAY_ROWS_DEFAULT = 10;
export const LIBRARY_DISPLAY_SAME_HEIGHT = 'library_display_same_height';
export const LIBRARY_DISPLAY_SAME_HEIGHT_DEFAULT = false;
export const LIBRARY_DISPLAY_COVER_SIZE = 'library_display_cover_size';
export const LIBRARY_DISPLAY_COVER_SIZE_DEFAULT = 200;

export const LAYOUT_QUERY_PARAM = 'layout';
export const SORT_QUERY_PARAM = 'sort';
export const ROWS_QUERY_PARAM = 'rows';
export const COVER_SIZE_QUERY_PARAM = 'cover_size';
export const SAME_HEIGHT_QUERY_PARAM = 'same_height';

@Injectable()
export class LibraryDisplayAdaptor {
  private _layout$ = new BehaviorSubject<string>(
    LIBRARY_DISPLAY_LAYOUT_DEFAULT
  );
  private _sortField$ = new BehaviorSubject<string>(
    LIBRARY_DISPLAY_SORT_FIELD_DEFAULT
  );
  private _rows$ = new BehaviorSubject<number>(LIBRARY_DISPLAY_ROWS_DEFAULT);
  private _sameHeight$ = new BehaviorSubject<boolean>(
    LIBRARY_DISPLAY_SAME_HEIGHT_DEFAULT
  );
  private _coverSize$ = new BehaviorSubject<number>(
    LIBRARY_DISPLAY_COVER_SIZE_DEFAULT
  );

  private ignoreFields = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authenticationAdaptor: AuthenticationAdaptor,
    private logger: LoggerService
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.logger.debug('query parameters changed:', params);
      this.ignoreFields = [];
      if (
        !!params[LAYOUT_QUERY_PARAM] &&
        !_.isEqual(params[LAYOUT_QUERY_PARAM], this._layout$.getValue())
      ) {
        this.ignoreFields.push(LAYOUT_QUERY_PARAM);
        this._layout$.next(params[LAYOUT_QUERY_PARAM]);
      }
      if (params[SORT_QUERY_PARAM]) {
        this.ignoreFields.push(SORT_QUERY_PARAM);
        this._sortField$.next(params[SORT_QUERY_PARAM]);
      }
      if (params[ROWS_QUERY_PARAM]) {
        this.ignoreFields.push(ROWS_QUERY_PARAM);
        this._rows$.next(parseInt(params[ROWS_QUERY_PARAM], 10));
      }
      if (params[SAME_HEIGHT_QUERY_PARAM]) {
        this.ignoreFields.push(SAME_HEIGHT_QUERY_PARAM);
        this._sameHeight$.next(params[SAME_HEIGHT_QUERY_PARAM] === 'true');
      }
      if (params[COVER_SIZE_QUERY_PARAM]) {
        this.ignoreFields.push(COVER_SIZE_QUERY_PARAM);
        this._coverSize$.next(parseInt(params[COVER_SIZE_QUERY_PARAM], 10));
      }
      this.loadUserSettings();
    });
    this.authenticationAdaptor.user$.subscribe((user: User) => {
      this.loadUserSettings();
    });
  }

  loadUserSettings(): void {
    this.logger.debug('loading library display user settings');
    if (!this.ignoreFields.includes(LAYOUT_QUERY_PARAM)) {
      this._layout$.next(this.getLayout());
    }
    if (!this.ignoreFields.includes(SORT_QUERY_PARAM)) {
      this._sortField$.next(this.getSortField());
    }
    if (!this.ignoreFields.includes(ROWS_QUERY_PARAM)) {
      this._rows$.next(this.getDisplayRows());
    }
    if (!this.ignoreFields.includes(SAME_HEIGHT_QUERY_PARAM)) {
      this._sameHeight$.next(this.getSameHeight());
    }
    if (!this.ignoreFields.includes(COVER_SIZE_QUERY_PARAM)) {
      this._coverSize$.next(this.getCoverSize());
    }
  }

  get layout$(): Observable<string> {
    return this._layout$.asObservable();
  }

  get sortField$(): Observable<string> {
    return this._sortField$.asObservable();
  }

  get rows$(): Observable<number> {
    return this._rows$.asObservable();
  }

  get sameHeight$(): Observable<boolean> {
    return this._sameHeight$.asObservable();
  }

  get coverSize$(): Observable<number> {
    return this._coverSize$.asObservable();
  }

  getLayout(): string {
    return (
      this.authenticationAdaptor.getPreference(LIBRARY_DISPLAY_LAYOUT) ||
      LIBRARY_DISPLAY_LAYOUT_DEFAULT
    );
  }

  setLayout(layout: string): void {
    this.logger.debug('setting layout:', layout);
    this.authenticationAdaptor.setPreference(LIBRARY_DISPLAY_LAYOUT, layout);
    this._layout$.next(layout);
    this.updateQueryParameters(LAYOUT_QUERY_PARAM, layout);
  }

  getSortField(): string {
    return (
      this.authenticationAdaptor.getPreference(LIBRARY_DISPLAY_SORT_FIELD) ||
      LIBRARY_DISPLAY_SORT_FIELD_DEFAULT
    );
  }

  setSortField(sortField: string, save: boolean = true): void {
    this.logger.debug('setting sort field:', sortField, save);
    if (save) {
      this.authenticationAdaptor.setPreference(
        LIBRARY_DISPLAY_SORT_FIELD,
        sortField
      );
    }
    this._sortField$.next(sortField);
    this.updateQueryParameters(SORT_QUERY_PARAM, sortField);
  }

  getDisplayRows(): number {
    return parseInt(
      this.authenticationAdaptor.getPreference(LIBRARY_DISPLAY_ROWS) ||
        `${LIBRARY_DISPLAY_ROWS_DEFAULT}`,
      10
    );
  }

  setDisplayRows(rows: number): void {
    this.logger.debug('setting display rows:', rows);
    this.authenticationAdaptor.setPreference(LIBRARY_DISPLAY_ROWS, `${rows}`);
    this._rows$.next(rows);
    this.updateQueryParameters(ROWS_QUERY_PARAM, `${rows}`);
  }

  getSameHeight(): boolean {
    return (
      (this.authenticationAdaptor.getPreference(LIBRARY_DISPLAY_SAME_HEIGHT) ||
        LIBRARY_DISPLAY_SAME_HEIGHT_DEFAULT) === '1'
    );
  }

  setSameHeight(sameHeight: boolean): void {
    this.logger.debug('setting same height:', sameHeight);
    this.authenticationAdaptor.setPreference(
      LIBRARY_DISPLAY_SAME_HEIGHT,
      sameHeight ? '1' : '0'
    );
    this._sameHeight$.next(sameHeight);
    this.updateQueryParameters(SAME_HEIGHT_QUERY_PARAM, sameHeight ? '1' : '0');
  }

  getCoverSize(): number {
    return parseInt(
      this.authenticationAdaptor.getPreference(LIBRARY_DISPLAY_COVER_SIZE) ||
        `${LIBRARY_DISPLAY_COVER_SIZE_DEFAULT}`,
      10
    );
  }

  setCoverSize(coverSize: number, save: boolean = true): void {
    this.logger.debug('setting cover size:', coverSize, save);
    if (save) {
      this.authenticationAdaptor.setPreference(
        LIBRARY_DISPLAY_COVER_SIZE,
        `${coverSize}`
      );
    }
    this._coverSize$.next(coverSize);
    this.updateQueryParameters(COVER_SIZE_QUERY_PARAM, `${coverSize}`);
  }

  updateQueryParameters(name: string, value: string): void {
    this.logger.debug('updating query parameter:', name, value);
    const queryParams: Params = Object.assign(
      {},
      this.activatedRoute.snapshot.queryParams
    );
    queryParams[name] = value;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams
    });
  }
}
