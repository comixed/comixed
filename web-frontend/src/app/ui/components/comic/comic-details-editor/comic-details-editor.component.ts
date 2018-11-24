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
import { Issue } from '../../../../models/issue';
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
  protected volume_selection_title = '';
  protected volume_selection_subtitle = '';
  private date_formatter = Intl.DateTimeFormat('en-us', { month: 'short', year: 'numeric' });

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
      });

    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSetup({
      api_key: this.user_service.get_user_preference('comic_vine_api_key', ''),
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
      api_key: this.library_scrape.api_key,
      series: this.library_scrape.series,
      volume: this.library_scrape.volume,
      issue_number: this.library_scrape.issue_number,
    }));
  }

  cancel_volume_selection(): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSetup({
      api_key: this.library_scrape.api_key,
      comic: this.library_scrape.comic,
      series: this.library_scrape.series,
      volume: this.library_scrape.volume,
      issue_number: this.library_scrape.issue_number,
    }));
  }

  set_current_volume(volume: Volume): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSetCurrentVolume({
      api_key: this.library_scrape.api_key,
      volume: volume,
      issue_number: this.library_scrape.issue_number,
    }));
  }

  select_current_issue(): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingScrapeMetadata({
      api_key: this.library_scrape.api_key,
      comic: this.library_scrape.comic,
      issue_id: this.library_scrape.current_issue.id,
    }));
  }

  save_changes(): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSaveLocalChanges({
      api_key: this.library_scrape.api_key,
      comic: this.library_scrape.comic,
      series: this.library_scrape.series,
      volume: this.library_scrape.volume,
      issue_number: this.library_scrape.issue_number,
    }));
  }

  load_current_issue_details(): void {
    this.volume_selection_title = `${this.library_scrape.current_issue.volume_name} #${this.library_scrape.current_issue.issue_number}`;
    this.volume_selection_subtitle = `Cover Date: ${this.date_formatter.format(new Date(this.library_scrape.current_issue.cover_date))}`;
  }

  get_current_issue_image_url(): string {
    if (this.library_scrape.current_issue === null) {
      return '';
    }
    return `${this.library_scrape.current_issue.cover_url}?api_key=${this.library_scrape.api_key.trim()}`;
  }

  save_api_key(): void {
    this.store.dispatch(new LibraryScrapingActions.LibraryScrapingSaveApiKey({
      api_key: this.library_scrape.api_key,
      comic: this.library_scrape.comic,
    }));
  }

  is_api_key_valid(): boolean {
    return (this.library_scrape.api_key || '').trim().length > 0;
  }

  is_good_match(volume: Volume): boolean {
    if (!this.is_perfect_match(volume)) {
      return this.comic.volume === volume.start_year;
    }

    return false;
  }

  is_perfect_match(volume: Volume): boolean {
    return (
      (this.comic.volume === volume.start_year) &&
      (this.comic.series === volume.name)
    );
  }
}
