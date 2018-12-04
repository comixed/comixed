/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../../../../app.state';
import * as LibraryActions from '../../../../actions/library.actions';
import * as LibraryScrapingActions from '../../../../actions/library-scraping.actions';
import * as UserActions from '../../../../actions/user.actions';
import { AlertService } from '../../../../services/alert.service';
import { UserService } from '../../../../services/user.service';
import { ComicService } from '../../../../services/comic.service';
import { Comic } from '../../../../models/comics/comic';
import { Volume } from '../../../../models/comics/volume';
import { Issue } from '../../../../models/scraping/issue';
import { LibraryScrape } from '../../../../models/library-scrape';
import { User } from '../../../../models/user/user';
import { Preference } from '../../../../models/user/preference';
import { COMICVINE_API_KEY } from '../../../../models/user/preferences.constants';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-comic-details-editor',
  templateUrl: './comic-details-editor.component.html',
  styleUrls: ['./comic-details-editor.component.css']
})
export class ComicDetailsEditorComponent implements OnInit, OnDestroy {
  @Input() comic: Comic;
  @Output() update: EventEmitter<Comic> = new EventEmitter();

  fetch_options: Array<MenuItem>;

  user$: Observable<User>;
  user_subscription: Subscription;
  user: User;

  library_scrape$: Observable<LibraryScrape>;
  library_scrape_subscription: Subscription;
  library_scrape: LibraryScrape;

  protected volume_selection_banner: string;
  private date_formatter = Intl.DateTimeFormat('en-us', { month: 'short', year: 'numeric' });

  protected api_key;
  protected series;
  protected volume;
  protected issue_number;
  protected skip_cache = false;

  constructor(
    private alert_service: AlertService,
    private user_service: UserService,
    private comic_service: ComicService,
    private store: Store<AppState>,
  ) {
    this.user$ = store.select('user');
    this.library_scrape$ = store.select('library_scraping');

    this.fetch_options = [
      {
        label: 'Fetch', icon: 'fa fa-search', command: () => this.fetch_candidates(false)
      },
      {
        label: 'Fetch (Skip Cache)', icon: 'fa fa-ban', command: () => this.fetch_candidates(true)
      },
    ];
  }

  ngOnInit() {
    this.user_subscription = this.user$.subscribe(
      (user: User) => {
        this.user = user;

        const api_key = this.user.preferences.find((preference: Preference) => {
          return preference.name === COMICVINE_API_KEY;
        });

        this.api_key = api_key ? api_key.value : '';
      });
    this.library_scrape_subscription = this.library_scrape$.subscribe(
      (library_scrape: LibraryScrape) => {
        this.library_scrape = library_scrape;

        this.series = this.library_scrape.series;
        this.volume = this.library_scrape.volume;
        this.issue_number = this.library_scrape.issue_number;
      });

    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSetup({
      api_key: this.api_key,
      comic: this.comic,
      series: this.comic.series,
      volume: this.comic.volume,
      issue_number: this.comic.issue_number,
    }));
  }

  ngOnDestroy() {
    this.library_scrape_subscription.unsubscribe();
  }

  fetch_candidates(skip_cache: boolean): void {
    this.skip_cache = skip_cache;
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingFetchVolumes({
      api_key: this.api_key,
      series: this.series,
      volume: this.volume,
      issue_number: this.issue_number,
      skip_cache: skip_cache,
    }));
  }

  select_volume(volume: Volume): void {
    if (volume) {
      this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSetCurrentVolume({
        api_key: this.api_key,
        volume: volume,
        issue_number: this.issue_number,
        skip_cache: this.skip_cache,
      }));
    } else {
      this.store.dispatch(new LibraryScrapingActions.LibraryScrapingClearCurrentVolume());
    }
  }

  select_issue(): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingScrapeMetadata({
      api_key: this.api_key,
      comic: this.library_scrape.comic,
      issue_id: this.library_scrape.current_issue.id,
      skip_cache: this.skip_cache,
    }));
  }

  cancel_selection(): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSetup({
      api_key: this.library_scrape.api_key,
      comic: this.library_scrape.comic,
      series: this.library_scrape.series,
      volume: this.library_scrape.volume,
      issue_number: this.library_scrape.issue_number,
    }));
  }

  save_changes(): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSaveLocalChanges({
      api_key: this.api_key,
      comic: this.comic,
      series: this.series,
      volume: this.volume,
      issue_number: this.issue_number,
    }));
  }

  reset_changes(): void {
    this.api_key = this.library_scrape.api_key;
    this.series = this.library_scrape.comic.series;
    this.volume = this.library_scrape.comic.volume;
    this.issue_number = this.library_scrape.comic.issue_number;
  }

  save_api_key(): void {
    this.store.dispatch(new UserActions.UserSetPreference({
      name: COMICVINE_API_KEY,
      value: this.api_key,
    }));
  }

  is_api_key_valid(): boolean {
    return (this.api_key || '').trim().length > 0;
  }

  is_ready_to_fetch(): boolean {
    return this.is_api_key_valid() && (this.series || '').trim().length > 0;
  }
}
