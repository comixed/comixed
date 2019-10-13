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
import { LibraryFilter } from 'app/models/actions/library-filter';
import { AuthenticationAdaptor } from 'app/user';
import {
  COVER_SIZE_QUERY_PARAM,
  LibraryDisplayAdaptor,
  ROWS_QUERY_PARAM,
  SAME_HEIGHT_QUERY_PARAM,
  SORT_QUERY_PARAM
} from 'app/library/adaptors/library-display.adaptor';

@Component({
  selector: 'app-comic-list-toolbar',
  templateUrl: './comic-list-toolbar.component.html',
  styleUrls: ['./comic-list-toolbar.component.scss']
})
export class ComicListToolbarComponent implements OnInit {
  @Input() library_filter: LibraryFilter;
  @Input() additional_sort_field_options: Array<SelectItem>;

  @Output() changeLayout = new EventEmitter<string>();

  layout_options: Array<SelectItem>;
  sort_field_options: Array<SelectItem>;
  rows_options: Array<SelectItem>;

  layout: string;
  sort_field: string;
  rows: number;
  same_height: boolean;
  cover_size: number;

  constructor(
    private auth_adaptor: AuthenticationAdaptor,
    private library_display_adaptor: LibraryDisplayAdaptor,
    private store: Store<AppState>,
    private translate: TranslateService,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
    this.load_layout_options();
    this.load_sort_field_options();
    this.load_rows_options();
    this.library_display_adaptor.layout$.subscribe(layout => {
      this.layout = layout;
    });
    this.library_display_adaptor.sortField$.subscribe(
      sort_field => (this.sort_field = sort_field)
    );
    this.library_display_adaptor.rows$.subscribe(rows => (this.rows = rows));
    this.library_display_adaptor.sameHeight$.subscribe(
      same_height => (this.same_height = same_height)
    );
    this.library_display_adaptor.coverSize$.subscribe(
      cover_size => (this.cover_size = cover_size)
    );
  }

  ngOnInit() {}

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
        value: 'sortableIssueNumber'
      },
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.added-date'
        ),
        value: 'addedDate'
      },
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.cover-date'
        ),
        value: 'coverDate'
      },
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.last-read-date'
        ),
        value: 'lastReadDate'
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
    this.sort_field = sort_field;
    this.library_display_adaptor.setSortField(sort_field);
  }

  set_rows(rows: number): void {
    this.rows = rows;
    this.library_display_adaptor.setDisplayRows(rows);
  }

  set_same_height(same_height: boolean): void {
    this.same_height = same_height;
    this.library_display_adaptor.setSameHeight(same_height);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
    this.library_display_adaptor.setCoverSize(cover_size, false);
  }

  save_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
    this.library_display_adaptor.setCoverSize(cover_size);
  }
}
