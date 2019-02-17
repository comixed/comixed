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

import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Comic } from "../../../../models/comics/comic";
import { LibraryFilter } from "../../../../models/library/library-filter";
import { LibraryDisplay } from "../../../../models/actions/library-display";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { Observable, Subscription } from "rxjs";
import * as LibraryActions from "../../../../actions/library.actions";
import * as LibraryDisplayActions from "../../../../actions/library-display.actions";
import { TranslateService } from "@ngx-translate/core";
import { SelectItem } from "primeng/api";

@Component({
  selector: "app-comic-list",
  templateUrl: "./comic-list.component.html",
  styleUrls: ["./comic-list.component.css"]
})
export class ComicListComponent implements OnInit, OnDestroy {
  @Input() comics: Array<Comic>;
  @Input() selected_comics: Array<Comic> = [];
  @Input() library_filter: LibraryFilter;

  private library_display$: Observable<LibraryDisplay>;
  private library_display_subscription: Subscription;
  library_display: LibraryDisplay;

  protected additional_sort_field_options: Array<SelectItem>;

  constructor(
    private translate: TranslateService,
    private store: Store<AppState>
  ) {
    this.library_display$ = this.store.select("library_display");
  }

  ngOnInit() {
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      }
    );
    this.load_additional_sort_field_options();
  }

  ngOnDestroy() {
    this.library_display_subscription.unsubscribe();
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
    this.store.dispatch(
      new LibraryDisplayActions.SetLibraryViewLayout({ layout: layout })
    );
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
