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
import { Observable, Subscription } from 'rxjs';
import * as ScrapingActions from 'app/actions/multiple-comics-scraping.actions';
import { MultipleComicsScraping } from 'app/models/scraping/multiple-comics-scraping';
import { Comic, SelectionAdaptor } from 'app/library';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-multi-comic-scraping-page',
  templateUrl: './multi-comic-scraping-page.component.html',
  styleUrls: ['./multi-comic-scraping-page.component.scss']
})
export class MultiComicScrapingPageComponent implements OnInit, OnDestroy {
  selectedComicsSubscription: Subscription;
  selected_comics: Comic[];
  langChangeSubscription: Subscription;

  scraping$: Observable<MultipleComicsScraping>;
  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;

  constructor(
    private store: Store<AppState>,
    private selectionAdaptor: SelectionAdaptor,
    private translateService: TranslateService,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {
    this.scraping$ = this.store.select('multiple_comic_scraping');
  }

  ngOnInit() {
    this.scraping_subscription = this.scraping$.subscribe(
      (scraping: MultipleComicsScraping) => {
        this.scraping = scraping;
      }
    );
    this.selectedComicsSubscription = this.selectionAdaptor.comic_selection$.subscribe(
      selected_comics => (this.selected_comics = selected_comics)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.scraping_subscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  startScraping(): void {
    this.store.dispatch(
      new ScrapingActions.MultipleComicsScrapingStart({
        selected_comics: this.selected_comics
      })
    );
    this.selectionAdaptor.deselect_all_comics();
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      {
        label: this.translateService.instant(
          'breadcrumb.entry.multi-comic-scraping-page'
        )
      }
    ]);
  }
}
