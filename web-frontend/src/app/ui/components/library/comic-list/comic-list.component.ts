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
  selector: "app-comic-list",
  templateUrl: "./comic-list.component.html",
  styleUrls: ["./comic-list.component.css"]
})
export class ComicListComponent implements OnInit {
  @Input() comics: Array<Comic>;
  @Input() selected_comics: Array<Comic> = [];
  @Input() library_filter: LibraryFilter;

  protected additional_sort_field_options: Array<SelectItem>;

  protected layout = "grid";
  protected sort_field = "added_date";
  protected rows = 10;
  protected same_height = true;
  protected cover_size = 200;

  constructor(
    private translate: TranslateService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.load_additional_sort_field_options();
  }

  private load_additional_sort_field_options(): void {
    this.additional_sort_field_options = [
      {
        label: this.translate.instant(
          "comic-list-toolbar.options.sort-field.publisher"
        ),
        value: "publisher"
      },
      {
        label: this.translate.instant(
          "comic-list-toolbar.options.sort-field.series"
        ),
        value: "series"
      }
    ];
  }

  set_layout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
  }

  set_sort_field(sort_field: string): void {
    this.sort_field = sort_field;
  }

  set_rows(rows: number): void {
    this.rows = rows;
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  set_same_height(same_height: boolean): void {
    this.same_height = same_height;
  }

  set_selected(comic: Comic, selected: boolean): void {
    this.store.dispatch(
      new LibraryActions.LibrarySetSelected({
        comic: comic,
        selected: selected
      })
    );
  }
}
