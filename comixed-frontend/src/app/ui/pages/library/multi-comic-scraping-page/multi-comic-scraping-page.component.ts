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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as LibraryActions from 'app/actions/library.actions';
import * as ScrapingActions from 'app/actions/multiple-comics-scraping.actions';
import { LibraryState } from 'app/models/state/library-state';
import { LibraryDisplay } from 'app/models/state/library-display';
import { MultipleComicsScraping } from 'app/models/scraping/multiple-comics-scraping';
import { SelectionState } from 'app/models/state/selection-state';
import * as SelectionActions from 'app/actions/selection.actions';

@Component({
  selector: 'app-multi-comic-scraping-page',
  templateUrl: './multi-comic-scraping-page.component.html',
  styleUrls: ['./multi-comic-scraping-page.component.css']
})
export class MultiComicScrapingPageComponent implements OnInit, OnDestroy {
  library$: Observable<LibraryState>;
  library_subscription: Subscription;
  library: LibraryState;

  library_display$: Observable<LibraryDisplay>;
  library_display_subscription: Subscription;
  library_display: LibraryDisplay;

  scraping$: Observable<MultipleComicsScraping>;
  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;

  selection_state$: Observable<SelectionState>;
  selection_state_subscription: Subscription;
  selection_state: SelectionState;

  constructor(private store: Store<AppState>) {
    this.library$ = this.store.select('library');
    this.library_display$ = this.store.select('library_display');
    this.scraping$ = this.store.select('multiple_comic_scraping');
    this.selection_state$ = this.store.select('selections');
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe(
      (library: LibraryState) => {
        this.library = library;
      }
    );
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      }
    );
    this.scraping_subscription = this.scraping$.subscribe(
      (scraping: MultipleComicsScraping) => {
        this.scraping = scraping;
      }
    );
    this.selection_state_subscription = this.selection_state$.subscribe(
      (selection_state: SelectionState) => {
        this.selection_state = selection_state;
      }
    );
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
    this.library_display_subscription.unsubscribe();
    this.scraping_subscription.unsubscribe();
    this.selection_state_subscription.unsubscribe();
  }

  start_scraping(): void {
    this.store.dispatch(
      new ScrapingActions.MultipleComicsScrapingStart({
        selected_comics: this.selection_state.selected_comics
      })
    );
    this.store.dispatch(new SelectionActions.SelectionReset());
  }
}
