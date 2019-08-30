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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as ScrapingActions from 'app/actions/single-comic-scraping.actions';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { SingleComicScraping } from 'app/models/scraping/single-comic-scraping';
import { ComicService } from 'app/services/comic.service';
import { AuthenticationAdaptor } from 'app/user';
import { AuthenticationState } from 'app/user/models/authentication-state';
import { Comic, ComicCollectionEntry, LibraryAdaptor } from 'app/library';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

export const PAGE_SIZE_PARAMETER = 'pagesize';
export const CURRENT_PAGE_PARAMETER = 'page';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details-page.component.html',
  styleUrls: ['./comic-details-page.component.scss']
})
export class ComicDetailsPageComponent implements OnInit, OnDestroy {
  comic_subscription: Subscription;
  comic: Comic;
  characters_subscription: Subscription;
  characters: ComicCollectionEntry[];
  teams_subscription: Subscription;
  teams: ComicCollectionEntry[];
  locations_subscription: Subscription;
  locations: ComicCollectionEntry[];
  story_arcs_subscription: Subscription;
  story_arcs: ComicCollectionEntry[];

  readonly TAB_PARAMETER = 'tab';

  single_comic_scraping$: Observable<SingleComicScraping>;
  single_comic_scraping_subscription: Subscription;
  single_comic_scraping: SingleComicScraping;

  protected current_tab: number;
  protected page_size: number;
  protected current_page: number;

  auth_subscription: Subscription;
  is_admin = false;

  constructor(
    private title_service: Title,
    private translate_service: TranslateService,
    private auth_adaptor: AuthenticationAdaptor,
    private library_adaptor: LibraryAdaptor,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private comic_service: ComicService,
    private store: Store<AppState>
  ) {
    this.single_comic_scraping$ = store.select('single_comic_scraping');
    this.activatedRoute.params.subscribe(params => {
      this.library_adaptor.get_comic_by_id(+params['id']);
    });
    activatedRoute.queryParams.subscribe(params => {
      this.current_tab = this.load_parameter(params[this.TAB_PARAMETER], 0);
    });
  }

  ngOnInit() {
    this.auth_subscription = this.auth_adaptor.role$.subscribe(
      roles => (this.is_admin = roles.is_admin)
    );
    this.comic_subscription = this.library_adaptor.current_comic$.subscribe(
      comic => {
        if (comic) {
          this.comic = comic;
          this.title_service.setTitle(
            this.translate_service.instant('comic-details-page.title', {
              id: this.comic.id,
              series: this.comic.series,
              volume: this.comic.volume,
              issue_number: this.comic.issue_number
            })
          );
        }
      }
    );
    this.characters_subscription = this.library_adaptor.character$.subscribe(
      characters => (this.characters = characters)
    );
    this.teams_subscription = this.library_adaptor.team$.subscribe(
      teams => (this.teams = teams)
    );
    this.locations_subscription = this.library_adaptor.location$.subscribe(
      locations => (this.locations = locations)
    );
    this.story_arcs_subscription = this.library_adaptor.story_arc$.subscribe(
      story_arcs => (this.story_arcs = story_arcs)
    );
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
    this.auth_subscription.unsubscribe();
    this.comic_subscription.unsubscribe();
    this.characters_subscription.unsubscribe();
    this.teams_subscription.unsubscribe();
    this.locations_subscription.unsubscribe();
    this.story_arcs_subscription.unsubscribe();
    this.single_comic_scraping_subscription.unsubscribe();
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
