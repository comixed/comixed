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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as DisplayActions from 'app/actions/library-display.actions';
import { LibraryFilter } from 'app/models/actions/library-filter';
import {
  COVER_SIZE,
  LibraryDisplay,
  ROWS,
  SAME_HEIGHT,
  SORT
} from 'app/models/state/library-display';
import * as UserActions from 'app/actions/user.actions';

@Component({
  selector: 'app-comic-list-toolbar',
  templateUrl: './comic-list-toolbar.component.html',
  styleUrls: ['./comic-list-toolbar.component.css']
})
export class ComicListToolbarComponent implements OnInit {
  @Input() library_display: LibraryDisplay;
  @Input() library_filter: LibraryFilter;
  @Input() additional_sort_field_options: Array<SelectItem>;

  @Output() changeLayout = new EventEmitter<string>();

  layout_options: Array<SelectItem>;
  sort_field_options: Array<SelectItem>;
  rows_options: Array<SelectItem>;

  constructor(
    private store: Store<AppState>,
    private translate: TranslateService,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.load_layout_options();
    this.load_sort_field_options();
    this.load_rows_options();
    this.activated_route.queryParams.subscribe((params: Params) => {
      if (params.layout) {
        this.store.dispatch(
          new DisplayActions.SetLibraryViewLayout({ layout: params.layout })
        );
      }
      if (params.sort) {
        this.store.dispatch(
          new DisplayActions.SetLibraryViewSort({ sort_field: params.sort })
        );
      }
      if (params.rows) {
        this.store.dispatch(
          new DisplayActions.SetLibraryViewRows({
            rows: parseInt(params.rows, 10)
          })
        );
      }
      if (params.cover_size) {
        this.store.dispatch(
          new DisplayActions.SetLibraryViewCoverSize({
            cover_size: parseInt(params.cover_size, 10)
          })
        );
      }
      if (params.same_height) {
        this.store.dispatch(
          new DisplayActions.SetLibraryViewUseSameHeight({
            same_height: parseInt(params.same_height, 10) === 0 ? false : true
          })
        );
      }
    });
  }

  private load_layout_options(): void {
    this.layout_options = [
      {
        label: this.translate.instant(
          'library-contents.options.layout.grid-layout'
        ),
        value: 'grid'
      },
      {
        label: this.translate.instant(
          'library-contents.options.layout.list-layout'
        ),
        value: 'list'
      }
    ];
  }

  private load_sort_field_options(): void {
    this.sort_field_options = [];
    if (this.additional_sort_field_options) {
      this.sort_field_options = this.sort_field_options.concat(
        this.additional_sort_field_options
      );
    }
    this.sort_field_options = this.sort_field_options.concat(
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.volume'
        ),
        value: 'volume'
      },
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.issue-number'
        ),
        value: 'sortable_issue_number'
      },
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.added-date'
        ),
        value: 'added_date'
      },
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.cover-date'
        ),
        value: 'cover_date'
      },
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.last-read-date'
        ),
        value: 'last_read_date'
      }
    );
  }

  private load_rows_options(): void {
    this.rows_options = [
      {
        label: this.translate.instant(
          'library-contents.options.rows.10-per-page'
        ),
        value: 10
      },
      {
        label: this.translate.instant(
          'library-contents.options.rows.25-per-page'
        ),
        value: 25
      },
      {
        label: this.translate.instant(
          'library-contents.options.rows.50-per-page'
        ),
        value: 50
      },
      {
        label: this.translate.instant(
          'library-contents.options.rows.100-per-page'
        ),
        value: 100
      }
    ];
  }

  set_sort_field(sort_field: string): void {
    this.store.dispatch(
      new DisplayActions.SetLibraryViewSort({ sort_field: sort_field })
    );
    this.store.dispatch(
      new UserActions.UserSetPreference({
        name: 'library_display_sort_field',
        value: sort_field
      })
    );
    this.update_query_parameters(SORT, sort_field);
  }

  set_rows(rows: number): void {
    this.store.dispatch(new DisplayActions.SetLibraryViewRows({ rows: rows }));
    this.store.dispatch(
      new UserActions.UserSetPreference({
        name: 'library_display_rows',
        value: `${rows}`
      })
    );
    this.update_query_parameters(ROWS, `${rows}`);
  }

  set_same_height(same_height: boolean): void {
    this.store.dispatch(
      new DisplayActions.SetLibraryViewUseSameHeight({
        same_height: same_height
      })
    );
    this.store.dispatch(
      new UserActions.UserSetPreference({
        name: 'library_display_same_height',
        value: same_height ? '1' : '0'
      })
    );
    this.update_query_parameters(SAME_HEIGHT, same_height ? '1' : '0');
  }

  set_cover_size(cover_size: number): void {
    this.store.dispatch(
      new DisplayActions.SetLibraryViewCoverSize({ cover_size: cover_size })
    );
  }

  save_cover_size(cover_size: number): void {
    this.store.dispatch(
      new UserActions.UserSetPreference({
        name: 'library_display_cover_size',
        value: `${cover_size}`
      })
    );
    this.update_query_parameters(COVER_SIZE, `${cover_size}`);
  }

  private update_query_parameters(name: string, value: string): void {
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
