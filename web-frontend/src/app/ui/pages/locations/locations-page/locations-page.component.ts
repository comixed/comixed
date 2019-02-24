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

import { Component, OnInit, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { Observable, Subscription } from "rxjs";
import * as LibraryActions from "../../../../actions/library.actions";
import { Library } from "../../../../models/actions/library";
import { TranslateService } from "@ngx-translate/core";
import { SelectItem } from "primeng/api";

@Component({
  selector: "app-locations-page",
  templateUrl: "./locations-page.component.html",
  styleUrls: ["./locations-page.component.css"]
})
export class LocationsPageComponent implements OnInit {
  private library$: Observable<Library>;
  private library_subscription: Subscription;
  library: Library;

  protected rows_options: Array<SelectItem>;
  rows = 10;

  constructor(
    private translate: TranslateService,
    private store: Store<AppState>
  ) {
    this.library$ = store.select("library");
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe((library: Library) => {
      this.library = library;
    });
    this.load_rows_options();
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
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
