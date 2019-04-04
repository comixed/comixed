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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as LibraryActions from 'app/actions/library.actions';
import * as ScrapingActions from 'app/actions/single-comic-scraping.actions';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { User } from 'app/models/user/user';
import { Role } from 'app/models/user/role';
import { Preference } from 'app/models/user/preference';
import { Library } from 'app/models/actions/library';
import { SingleComicScraping } from 'app/models/scraping/single-comic-scraping';
import { ComicService } from 'app/services/comic.service';
import { Comic } from 'app/models/comics/comic';

export const PAGE_SIZE_PARAMETER = 'pagesize';
export const CURRENT_PAGE_PARAMETER = 'page';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit, OnDestroy {
  readonly TAB_PARAMETER = 'tab';

  private library$: Observable<Library>;
  private library_subscription: Subscription;
  public library: Library;

  single_comic_scraping$: Observable<SingleComicScraping>;
  single_comic_scraping_subscription: Subscription;
  single_comic_scraping: SingleComicScraping;

  private comic_id = -1;
  public comic = null;
  protected current_tab: number;
  protected page_size: number;
  protected current_page: number;

  user$: Observable<User>;
  user_subscription: Subscription;
  user: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private comic_service: ComicService,
    private store: Store<AppState>
  ) {
    this.library$ = store.select('library');
    this.single_comic_scraping$ = store.select('single_comic_scraping');
    this.activatedRoute.params.subscribe(params => {
      this.comic_id = +params['id'];
    });
    this.user$ = store.select('user');
    activatedRoute.queryParams.subscribe(params => {
      this.current_tab = this.load_parameter(params[this.TAB_PARAMETER], 0);
    });
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe((library: Library) => {
      this.library = library;

      if (this.comic === null) {
        this.comic =
          library.comics.find((comic: Comic) => {
            return comic.id === this.comic_id;
          }) || null;
      }
    });
    this.single_comic_scraping_subscription = this.single_comic_scraping$.subscribe(
      (library_scrape: SingleComicScraping) => {
        this.single_comic_scraping = library_scrape;

        if (this.single_comic_scraping.data_scraped) {
          this.comic = this.single_comic_scraping.comic;
          this.store.dispatch(
            new ScrapingActions.SingleComicScrapingClearDataScrapedFlag()
          );
        }
      }
    );
    this.user_subscription = this.user$.subscribe((user: User) => {
      this.user = user;
    });
    this.activatedRoute.queryParams.subscribe(params => {
      this.set_page_size(
        parseInt(this.load_parameter(params[PAGE_SIZE_PARAMETER], '100'), 10)
      );
      this.set_current_page(
        parseInt(this.load_parameter(params[CURRENT_PAGE_PARAMETER], '0'), 10)
      );
      this.current_tab = this.load_parameter(params[this.TAB_PARAMETER], 0);
    });
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
    this.single_comic_scraping_subscription.unsubscribe();
    this.user_subscription.unsubscribe();
  }

  set_page_size(page_size: number): void {
    this.page_size = page_size;
    this.update_params(PAGE_SIZE_PARAMETER, `${this.page_size}`);
  }

  set_current_page(current_page: number): void {
    this.current_page = current_page;
    this.update_params(CURRENT_PAGE_PARAMETER, `${this.current_page}`);
  }

  set_current_tab(current_tab: number): void {
    this.current_tab = current_tab;
    this.update_params(this.TAB_PARAMETER, `${this.current_tab}`);
  }

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign(
      {},
      this.activatedRoute.snapshot.queryParams
    );
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams
    });
  }

  private load_parameter(value: string, defvalue: any): any {
    if (value && value.length) {
      return parseInt(value, 10);
    }
    return defvalue;
  }
}
