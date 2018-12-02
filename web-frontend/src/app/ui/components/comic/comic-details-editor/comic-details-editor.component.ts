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
import { AlertService } from '../../../../services/alert.service';
import { UserService } from '../../../../services/user.service';
import { ComicService } from '../../../../services/comic.service';
import { Comic } from '../../../../models/comics/comic';
import { Volume } from '../../../../models/comics/volume';
import { Issue } from '../../../../models/scraping/issue';
import { LibraryScrape } from '../../../../models/library-scrape';

@Component({
  selector: 'app-comic-details-editor',
  templateUrl: './comic-details-editor.component.html',
  styleUrls: ['./comic-details-editor.component.css']
})
export class ComicDetailsEditorComponent implements OnInit, OnDestroy {
  @Input() comic: Comic;
  @Output() update: EventEmitter<Comic> = new EventEmitter();

  library_scrape$: Observable<LibraryScrape>;
  library_scrape_subscription: Subscription;
  library_scrape: LibraryScrape;

  protected volume_selection_banner: string;
  private date_formatter = Intl.DateTimeFormat('en-us', { month: 'short', year: 'numeric' });

  protected api_key;
  protected series;
  protected volume;
  protected issue_number;

  constructor(
    private alert_service: AlertService,
    private user_service: UserService,
    private comic_service: ComicService,
    private store: Store<AppState>,
  ) {
    this.library_scrape$ = store.select('library_scraping');
  }

  ngOnInit() {
    this.library_scrape_subscription = this.library_scrape$.subscribe(
      (library_scrape: LibraryScrape) => {
        this.library_scrape = library_scrape;

        this.api_key = this.library_scrape.api_key;
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

  fetch_candidates(): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingFetchVolumes({
      api_key: this.api_key,
      series: this.series,
      volume: this.volume,
      issue_number: this.issue_number,
    }));
  }

  select_volume(volume: Volume): void {
    if (volume) {
      this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSetCurrentVolume({
        api_key: this.api_key,
        volume: volume,
        issue_number: this.issue_number,
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
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSaveApiKey({
      api_key: this.api_key,
      comic: this.library_scrape.comic,
    }));
  }

  is_api_key_valid(): boolean {
    return (this.api_key || '').trim().length > 0;
  }

  is_ready_to_fetch(): boolean {
    return this.is_api_key_valid() && (this.series || '').trim().length > 0;
  }
}
