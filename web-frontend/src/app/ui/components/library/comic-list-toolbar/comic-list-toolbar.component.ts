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

import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { SelectItem } from "primeng/api";
import { LibraryFilter } from "../../../../models/library/library-filter";

@Component({
  selector: "app-comic-list-toolbar",
  templateUrl: "./comic-list-toolbar.component.html",
  styleUrls: ["./comic-list-toolbar.component.css"]
})
export class ComicListToolbarComponent implements OnInit {
  @Input() layout: string;
  @Input() sort_field: string;
  @Input() additional_sort_field_options: Array<SelectItem>;
  @Input() rows: number;
  @Input() cover_size: number;
  @Input() same_height: boolean;
  @Input() library_filter: LibraryFilter;

  @Output() layoutChanged = new EventEmitter<string>();
  @Output() sortFieldChanged = new EventEmitter<string>();
  @Output() rowsChanged = new EventEmitter<number>();
  @Output() sameHeight = new EventEmitter<boolean>();
  @Output() coverSizeChanged = new EventEmitter<number>();

  protected layout_options: Array<SelectItem>;
  protected sort_field_options: Array<SelectItem>;
  protected rows_options: Array<SelectItem>;

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.load_layout_options();
    this.load_sort_field_options();
    this.load_rows_options();
  }

  private load_layout_options(): void {
    this.layout_options = [
      {
        label: this.translate.instant(
          "library-contents.options.layout.grid-layout"
        ),
        value: "grid"
      },
      {
        label: this.translate.instant(
          "library-contents.options.layout.list-layout"
        ),
        value: "list"
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
          "comic-list-toolbar.options.sort-field.volume"
        ),
        value: "volume"
      },
      {
        label: this.translate.instant(
          "comic-list-toolbar.options.sort-field.issue-number"
        ),
        value: "issue_number"
      },
      {
        label: this.translate.instant(
          "comic-list-toolbar.options.sort-field.added-date"
        ),
        value: "added_date"
      },
      {
        label: this.translate.instant(
          "comic-list-toolbar.options.sort-field.cover-date"
        ),
        value: "cover_date"
      },
      {
        label: this.translate.instant(
          "comic-list-toolbar.options.sort-field.last-read-date"
        ),
        value: "last_read_date"
      }
    );
  }

  private load_rows_options(): void {
    this.rows_options = [
      {
        label: this.translate.instant(
          "library-contents.options.rows.10-per-page"
        ),
        value: 10
      },
      {
        label: this.translate.instant(
          "library-contents.options.rows.25-per-page"
        ),
        value: 25
      },
      {
        label: this.translate.instant(
          "library-contents.options.rows.50-per-page"
        ),
        value: 50
      },
      {
        label: this.translate.instant(
          "library-contents.options.rows.100-per-page"
        ),
        value: 100
      }
    ];
  }
}
