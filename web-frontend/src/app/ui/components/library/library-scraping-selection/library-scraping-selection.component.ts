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

import { Component, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable ,  Subscription } from 'rxjs';
import { AppState } from '../../../../app.state';
import * as ScrapingActions from '../../../../actions/multiple-comics-scraping.actions';
import { MultipleComicsScraping } from '../../../../models/scraping/multiple-comics-scraping';
import { Comic } from '../../../../models/comics/comic';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-library-scraping-selection',
  templateUrl: './library-scraping-selection.component.html',
  styleUrls: ['./library-scraping-selection.component.css']
})
export class LibraryScrapingSelectionComponent implements OnInit, OnDestroy {
  @Input() selected_comics: Array<Comic>;

  scraping$: Observable<MultipleComicsScraping>;
  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;

  available_comics = [];

  constructor(
    private user_service: UserService,
    private store: Store<AppState>,
  ) {
    this.scraping$ = store.select('multiple_comic_scraping');
  }

  @Input()
  set comics(comics: Array<Comic>) {
    this.available_comics = comics.slice();
  }

  ngOnInit() {
    this.scraping_subscription = this.scraping$.subscribe(
      (scraping: MultipleComicsScraping) => {
        this.scraping = scraping;

        if (this.scraping.started && this.scraping.selected_comics.length === 0) {
          this.selected_comics = [];
          this.store.dispatch(new ScrapingActions.MultipleComicsScrapingSetup({ api_key: this.scraping.api_key }));
        }
      });

  }

  ngOnDestroy() {
    this.scraping_subscription.unsubscribe();
  }
}
