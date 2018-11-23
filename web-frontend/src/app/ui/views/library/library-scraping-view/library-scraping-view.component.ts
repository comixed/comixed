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

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../../../../app.state';
import * as ScrapingActions from '../../../../actions/multiple-comics-scraping.actions';
import { MultipleComicsScraping } from '../../../../models/scraping/multiple-comics-scraping';
import { Comic } from '../../../../models/comics/comic';
import { Library } from '../../../../models/library';

@Component({
  selector: 'app-library-scraping-view',
  templateUrl: './library-scraping-view.component.html',
  styleUrls: ['./library-scraping-view.component.css']
})
export class LibraryScrapingViewComponent implements OnInit, OnDestroy {
  scraping$: Observable<MultipleComicsScraping>;
  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;

  library$: Observable<Library>;
  library_subscription: Subscription;
  library: Library;

  selected_comics = [];

  constructor(
    private store: Store<AppState>,
  ) {
    this.scraping$ = store.select('multiple_comic_scraping');
    this.library$ = store.select('library');
  }

  ngOnInit() {
    this.scraping_subscription = this.scraping$.subscribe(
      (scraping: MultipleComicsScraping) => {
        this.scraping = scraping;
      });
    this.library_subscription = this.library$.subscribe(
      (library: Library) => {
        this.library = library;

        if (!this.scraping || !this.scraping.available_comics.length) {
          this.store.dispatch(new ScrapingActions.MultipleComicsScrapingSetAvailableComics(this.library.comics));
        }
      });
    this.store.dispatch(new ScrapingActions.MultipleComicsScrapingSetup({ api_key: this.scraping.api_key }));
  }

  ngOnDestroy() {
    this.scraping_subscription.unsubscribe();
    this.library_subscription.unsubscribe();
  }
}
