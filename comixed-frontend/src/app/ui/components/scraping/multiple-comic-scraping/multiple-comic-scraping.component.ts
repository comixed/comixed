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

import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../../../../app.state';
import * as MultiScrapingActions from '../../../../actions/multiple-comics-scraping.actions';
import * as SingleScrapingActions from '../../../../actions/single-comic-scraping.actions';
import { MultipleComicsScraping } from '../../../../models/scraping/multiple-comics-scraping';
import { Comic } from '../../../../models/comics/comic';

@Component({
  selector: 'app-multiple-comic-scraping',
  templateUrl: './multiple-comic-scraping.component.html',
  styleUrls: ['./multiple-comic-scraping.component.css']
})
export class MultipleComicScrapingComponent implements OnInit {
  @Input() multi_scraping: MultipleComicsScraping;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {}

  comic_scraped(): void {
    this.store.dispatch(
      new MultiScrapingActions.MultipleComicsScrapingComicScraped({
        comic: this.multi_scraping.current_comic
      })
    );
  }
}
