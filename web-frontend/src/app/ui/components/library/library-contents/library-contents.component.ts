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

import { Component, OnInit, Input } from "@angular/core";
import { Comic } from "../../../../models/comics/comic";
import { LibraryFilter } from "../../../../models/library/library-filter";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import * as LibraryActions from "../../../../actions/library.actions";
import { TranslateService } from "@ngx-translate/core";
import { SelectItem } from "primeng/api";

@Component({
  selector: "app-library-contents",
  templateUrl: "./library-contents.component.html",
  styleUrls: ["./library-contents.component.css"]
})
export class LibraryContentsComponent implements OnInit {
  @Input() comics: Array<Comic>;
  @Input() library_filter: LibraryFilter;

  protected layout_options: Array<SelectItem>;
  protected rows_options: Array<SelectItem>;

  protected layout = "grid";
  protected rows = 10;
  protected same_height = true;
  protected cover_size = 200;

  constructor(
    private translate: TranslateService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.load_layout_options();
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

  set_layout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
  }
}
