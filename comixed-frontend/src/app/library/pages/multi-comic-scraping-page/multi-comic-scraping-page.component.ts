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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Comic } from 'app/comics';
import { Store } from '@ngrx/store';
import { AppState } from 'app/library';
import { selectScrapingMultipleComics } from 'app/comics/selectors/scrape-multiple-comic.selectors';
import {
  removeScrapedComic,
  skipComic
} from 'app/comics/actions/scrape-multiple-comic.actions';
import { LoggerService } from '@angular-ru/logger';
import { Router } from '@angular/router';
import { AlertService } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import { selectScrapeComicState } from 'app/comics/selectors/scrape-comic.selectors';

@Component({
  selector: 'app-multi-comic-scraping-page',
  templateUrl: './multi-comic-scraping-page.component.html',
  styleUrls: ['./multi-comic-scraping-page.component.scss']
})
export class MultiComicScrapingPageComponent {
  comics: Comic[] = [];
  currentComicSubscription: Subscription;
  currentComic: Comic = null;

  constructor(
    private logger: LoggerService,
    private store: Store<AppState>,
    private router: Router,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    this.store.select(selectScrapingMultipleComics).subscribe(comics => {
      if (comics.length > 0) {
        this.logger.info('scraping comics:', comics);
        this.comics = comics;
        this.currentComic = comics[0];
      } else {
        this.alertService.info(
          this.translateService.instant('scraping.multiple-comics.completed')
        );
        this.router.navigate(['comics']);
      }
    });
    this.store.select(selectScrapeComicState).subscribe(state => {
      if (state.success) {
        this.logger.info('removing scraped comic:', state.comic);
        this.store.dispatch(removeScrapedComic({ comic: state.comic }));
      }
    });
  }

  skipComic(comic: Comic): void {
    this.store.dispatch(skipComic({ comic: comic }));
  }
}
