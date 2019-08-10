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
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { User } from 'app/models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';

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
export const COVER_SIZE_QUERY_PARAM = 'cover_size';
export const ROWS_QUERY_PARAM = 'rows';
export const SAME_HEIGHT_QUERY_PARAM = 'same_height';
export const SORT_QUERY_PARAM = 'sort';

@Injectable()
export class LibraryDisplayAdaptor {
  _layout$ = new BehaviorSubject<string>(LIBRARY_DISPLAY_LAYOUT_DEFAULT);
  _sort_field$ = new BehaviorSubject<string>(
    LIBRARY_DISPLAY_SORT_FIELD_DEFAULT
  );
  _rows$ = new BehaviorSubject<number>(LIBRARY_DISPLAY_ROWS_DEFAULT);
  _same_height$ = new BehaviorSubject<boolean>(
    LIBRARY_DISPLAY_SAME_HEIGHT_DEFAULT
  );
  _cover_size$ = new BehaviorSubject<number>(
    LIBRARY_DISPLAY_COVER_SIZE_DEFAULT
  );

  private ignore_fields = [];

  constructor(
    private router: Router,
    private activated_route: ActivatedRoute,
    private auth_adaptor: AuthenticationAdaptor
  ) {
    this.activated_route.queryParams.subscribe((params: Params) => {
      this.ignore_fields = [];
      if (params[LAYOUT_QUERY_PARAM]) {
        this.ignore_fields.push(LAYOUT_QUERY_PARAM);
        this._layout$.next(params[LAYOUT_QUERY_PARAM]);
      }
      if (params[SORT_QUERY_PARAM]) {
        this.ignore_fields.push(SORT_QUERY_PARAM);
        this._sort_field$.next(params[SORT_QUERY_PARAM]);
      }
      if (params[ROWS_QUERY_PARAM]) {
        this.ignore_fields.push(ROWS_QUERY_PARAM);
        this._rows$.next(parseInt(params[ROWS_QUERY_PARAM], 10));
      }
      if (params[SAME_HEIGHT_QUERY_PARAM]) {
        this.ignore_fields.push(SAME_HEIGHT_QUERY_PARAM);
        this._same_height$.next(params[SAME_HEIGHT_QUERY_PARAM] === '1');
      }
      if (params[COVER_SIZE_QUERY_PARAM]) {
        this.ignore_fields.push(COVER_SIZE_QUERY_PARAM);
        this._cover_size$.next(parseInt(params[COVER_SIZE_QUERY_PARAM], 10));
      }
      this.load_user_settings();
    });
    this.auth_adaptor.user$.subscribe((user: User) => {
      this.load_user_settings();
    });
  }

  load_user_settings(): void {
    if (!this.ignore_fields.includes(LAYOUT_QUERY_PARAM)) {
      this._layout$.next(this.get_layout());
    }
    if (!this.ignore_fields.includes(SORT_QUERY_PARAM)) {
      this._sort_field$.next(this.get_sort_field());
    }
    if (!this.ignore_fields.includes(ROWS_QUERY_PARAM)) {
      this._rows$.next(this.get_display_rows());
    }
    if (!this.ignore_fields.includes(SAME_HEIGHT_QUERY_PARAM)) {
      this._same_height$.next(this.get_same_height());
    }
    if (!this.ignore_fields.includes(COVER_SIZE_QUERY_PARAM)) {
      this._cover_size$.next(this.get_cover_size());
    }
  }

  get layout$(): Observable<string> {
    return this._layout$.asObservable();
  }

  get sort_field$(): Observable<string> {
    return this._sort_field$.asObservable();
  }

  get rows$(): Observable<number> {
    return this._rows$.asObservable();
  }

  get same_height$(): Observable<boolean> {
    return this._same_height$.asObservable();
  }

  get cover_size$(): Observable<number> {
    return this._cover_size$.asObservable();
  }

  get_layout(): string {
    return (
      this.auth_adaptor.get_preference(LIBRARY_DISPLAY_LAYOUT) ||
      LIBRARY_DISPLAY_LAYOUT_DEFAULT
    );
  }

  set_layout(layout: string): void {
    this.auth_adaptor.set_preference(LIBRARY_DISPLAY_LAYOUT, layout);
    this._layout$.next(layout);
    this.update_query_parameters(LAYOUT_QUERY_PARAM, layout);
  }

  get_sort_field(): string {
    return (
      this.auth_adaptor.get_preference(LIBRARY_DISPLAY_SORT_FIELD) ||
      LIBRARY_DISPLAY_SORT_FIELD_DEFAULT
    );
  }

  set_sort_field(sort_field: string, save: boolean = true): void {
    if (save) {
      this.auth_adaptor.set_preference(LIBRARY_DISPLAY_SORT_FIELD, sort_field);
    }
    this._sort_field$.next(sort_field);
    this.update_query_parameters(SORT_QUERY_PARAM, sort_field);
  }

  get_display_rows(): number {
    return parseInt(
      this.auth_adaptor.get_preference(LIBRARY_DISPLAY_ROWS) ||
        `${LIBRARY_DISPLAY_ROWS_DEFAULT}`,
      10
    );
  }

  set_display_rows(rows: number): void {
    this.auth_adaptor.set_preference(LIBRARY_DISPLAY_ROWS, `${rows}`);
    this._rows$.next(rows);
    this.update_query_parameters(ROWS_QUERY_PARAM, `${rows}`);
  }

  get_same_height(): boolean {
    return (
      (this.auth_adaptor.get_preference(LIBRARY_DISPLAY_SAME_HEIGHT) ||
        LIBRARY_DISPLAY_SAME_HEIGHT_DEFAULT) === '1'
    );
  }

  set_same_height(same_height: boolean): void {
    this.auth_adaptor.set_preference(
      LIBRARY_DISPLAY_SAME_HEIGHT,
      same_height ? '1' : '0'
    );
    this._same_height$.next(same_height);
    this.update_query_parameters(
      SAME_HEIGHT_QUERY_PARAM,
      same_height ? '1' : '0'
    );
  }

  get_cover_size(): number {
    return parseInt(
      this.auth_adaptor.get_preference(LIBRARY_DISPLAY_COVER_SIZE) ||
        `${LIBRARY_DISPLAY_COVER_SIZE_DEFAULT}`,
      10
    );
  }

  set_cover_size(cover_size: number, save: boolean = true): void {
    if (save) {
      this.auth_adaptor.set_preference(
        LIBRARY_DISPLAY_COVER_SIZE,
        `${cover_size}`
      );
      this.update_query_parameters(COVER_SIZE_QUERY_PARAM, `${cover_size}`);
    }
    this._cover_size$.next(cover_size);
  }

  update_query_parameters(name: string, value: string): void {
    const queryParams: Params = Object.assign(
      {},
      this.activated_route.snapshot.queryParams
    );
    queryParams[name] = value;
    this.router.navigate([], {
      relativeTo: this.activated_route,
      queryParams: queryParams
    });
  }
}
