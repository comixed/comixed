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

import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Comic } from "../../../../models/comics/comic";
import { ActivatedRoute, Params } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { Observable, Subscription } from "rxjs";
import * as LibraryActions from "../../../../actions/library.actions";
import { Library } from "../../../../models/actions/library";
import { TranslateService } from "@ngx-translate/core";
import { SelectItem } from "primeng/api";

@Component({
  selector: "app-location-details-page",
  templateUrl: "./location-details-page.component.html",
  styleUrls: ["./location-details-page.component.css"]
})
export class LocationDetailsPageComponent implements OnInit {
  private library$: Observable<Library>;
  private library_subscription: Subscription;
  library: Library;

  protected layout = "grid";
  protected sort_field = "volume";
  protected rows = 10;
  protected same_height = true;
  protected cover_size = 200;

  location_name: string;
  comics: Array<Comic> = [];
  selected_comics: Array<Comic> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private store: Store<AppState>
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.location_name = params["name"];
    });
    this.library$ = store.select("library");
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe((library: Library) => {
      this.library = library;

      this.comics = [].concat(this.library.comics);
      this.selected_comics = [].concat(this.library.selected_comics);
    });
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
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
}
