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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScrapingAdaptor } from 'app/comics/adaptors/scraping.adaptor';
import { Comic } from 'app/comics';

@Component({
  selector: 'app-multi-comic-scraping-page',
  templateUrl: './multi-comic-scraping-page.component.html',
  styleUrls: ['./multi-comic-scraping-page.component.scss']
})
export class MultiComicScrapingPageComponent implements OnInit, OnDestroy {
  comicsSubscription: Subscription;
  comics: Comic[] = [];
  currentComicSubscription: Subscription;
  currentComic: Comic = null;

  constructor(private scrapingAdaptor: ScrapingAdaptor) {}

  ngOnInit() {
    this.comicsSubscription = this.scrapingAdaptor.comics$.subscribe(
      comics => (this.comics = comics)
    );
    this.currentComicSubscription = this.scrapingAdaptor.comic$.subscribe(
      comic => (this.currentComic = comic)
    );
  }

  ngOnDestroy() {
    this.comicsSubscription.unsubscribe();
    this.currentComicSubscription.unsubscribe();
  }

  skipComic(comic: Comic):void {
    this.scrapingAdaptor.skipComic(comic);
  }
}
