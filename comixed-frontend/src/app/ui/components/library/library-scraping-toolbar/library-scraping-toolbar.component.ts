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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { AppState } from 'app/app.state';
import * as ScrapingActions from 'app/actions/multiple-comics-scraping.actions';
import { MultipleComicsScraping } from 'app/models/scraping/multiple-comics-scraping';
import { Comic } from 'app/models/comics/comic';

@Component({
  selector: 'app-library-scraping-toolbar',
  templateUrl: './library-scraping-toolbar.component.html',
  styleUrls: ['./library-scraping-toolbar.component.css']
})
export class LibraryScrapingToolbarComponent implements OnInit, OnDestroy {
  @Input() selected_comics: Array<Comic>;

  scraping$: Observable<MultipleComicsScraping>;
  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;

  constructor(private store: Store<AppState>) {
    this.scraping$ = store.select('multiple_comic_scraping');
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

  start_scraping(): void {
    this.store.dispatch(
      new ScrapingActions.MultipleComicsScrapingStart({
        selected_comics: this.selected_comics
      })
    );
  }
}
