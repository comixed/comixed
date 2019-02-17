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
import * as ScrapingActions from "../../../../actions/multiple-comics-scraping.actions";
import { MultipleComicsScraping } from "../../../../models/scraping/multiple-comics-scraping";

@Component({
  selector: "app-multi-comic-scraping-page",
  templateUrl: "./multi-comic-scraping-page.component.html",
  styleUrls: ["./multi-comic-scraping-page.component.css"]
})
export class MultiComicScrapingPageComponent implements OnInit, OnDestroy {
  private scraping$: Observable<MultipleComicsScraping>;
  private scraping_subscription: Subscription;
  private scraping: MultipleComicsScraping;

  constructor(private store: Store<AppState>) {
    this.scraping$ = this.store.select("multiple_comic_scraping");
  }

  ngOnInit() {
    this.scraping_subscription = this.scraping$.subscribe(
      (scraping: MultipleComicsScraping) => {
        this.scraping = scraping;
      }
    );
  }

  ngOnDestroy() {
    this.scraping_subscription.unsubscribe();
  }
}
