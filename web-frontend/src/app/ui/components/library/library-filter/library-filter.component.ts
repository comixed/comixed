/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import * as FilterActions from '../../../../actions/library-filter.actions';

@Component({
  selector: 'app-library-filter',
  templateUrl: './library-filter.component.html',
  styleUrls: ['./library-filter.component.css']
})
export class LibraryFilterComponent implements OnInit {
  @Input() publisher = '';
  @Input() series = '';
  @Input() volume = '';
  @Input() from_year = 0;
  @Input() to_year = 0;
  @Input() collapsed = true;

  constructor(
    private store: Store<AppState>,
  ) { }

  ngOnInit() {
  }

  apply_filters(): void {
    this.store.dispatch(new FilterActions.LibraryFilterSetFilters({
      publisher: this.publisher,
      series: this.series,
      volume: this.volume,
      from_year: this.from_year,
      to_year: this.to_year,
    }));
    this.collapsed = true;
  }

  reset_filters(): void {
    this.store.dispatch(new FilterActions.LibraryFilterReset());
    this.collapsed = true;
  }

  set_collapsed(collapsed: boolean): void {
    this.collapsed = collapsed;
  }

  get_header(): string {
    let result = 'Library Filters';

    if (this.collapsed) {
      if (this.is_filtering()) {
        if (this.publisher.length) {
          result = `${result} [Publisher contains "${this.publisher}"]`;
        }
        if (this.series.length) {
          result = `${result} [Series contains "${this.series}"]`;
        }
        if (this.volume.length) {
          result = `${result} [Volume is "${this.volume}"]`;
        }
        if (this.from_year > 0 && this.to_year > 0) {
          result = `${result} [Cover year between ${this.from_year} and ${this.to_year}]`;
        } else {
          if (this.from_year > 0) {
            result = `${result} [Cover year is >= ${this.from_year}]`;
          }
          if (this.to_year > 0) {
            result = `${result} [Cover year is <= ${this.to_year}]`;
          }
        }
      } else {
        result = `${result} [Showing all comics]`;
      }
    }

    return result;
  }

  is_filtering(): boolean {
    return !(
      !this.publisher.length &&
      !this.series.length &&
      !this.volume.length &&
      ((this.from_year || 0) === 0) &&
      ((this.to_year || 0) === 0)
    );
  }
}
