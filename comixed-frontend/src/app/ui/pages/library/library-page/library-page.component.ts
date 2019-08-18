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
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { LibraryFilter } from 'app/models/actions/library-filter';
import { MultipleComicsScraping } from 'app/models/scraping/multiple-comics-scraping';
import * as ScrapingActions from 'app/actions/multiple-comics-scraping.actions';
import { Observable, Subscription } from 'rxjs';
import { Comic } from 'app/library';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { SelectionState } from 'app/models/state/selection-state';
import { AuthenticationAdaptor, User } from 'app/user';
import { LibraryAdaptor } from 'app/library';

@Component({
  selector: 'app-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.css']
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  auth_subscription: Subscription;
  user: User;
  comics: Comic[] = [];
  comics_subscription: Subscription;
  selected_comics: Comic[] = [];
  rescan_count = 0;
  rescan_count_subscription: Subscription;
  import_count = 0;
  import_count_subscription: Subscription;

  private library_filter$: Observable<LibraryFilter>;

  private library_filter_subscription: Subscription;
  library_filter: LibraryFilter;
  scraping$: Observable<MultipleComicsScraping>;

  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;
  selection_state$: Observable<SelectionState>;

  selection_state_subscription: Subscription;
  selection_state: SelectionState;

  constructor(
    private router: Router,
    private auth_adaptor: AuthenticationAdaptor,
    private library_adaptor: LibraryAdaptor,
    private user_service: UserService,
    private comic_service: ComicService,
    private confirm_service: ConfirmationService,
    private store: Store<AppState>,
    private translate: TranslateService
  ) {
    this.library_filter$ = store.select('library_filter');
    this.scraping$ = store.select('multiple_comic_scraping');
    this.selection_state$ = store.select('selections');
  }

  ngOnInit() {
    this.auth_subscription = this.auth_adaptor.user$.subscribe(
      user => (this.user = user)
    );
    this.comics_subscription = this.library_adaptor.comic$.subscribe(
      comics => (this.comics = comics)
    );
    this.import_count_subscription = this.library_adaptor.pending_import$.subscribe(
      import_count => (this.import_count = import_count)
    );
    this.rescan_count_subscription = this.library_adaptor.pending_rescan$.subscribe(
      rescan_count => (this.rescan_count = rescan_count)
    );
    this.library_filter_subscription = this.library_filter$.subscribe(
      (library_filter: LibraryFilter) => {
        if (!this.library_filter || library_filter.changed) {
          this.library_filter = library_filter;
        }
      }
    );
    this.scraping_subscription = this.scraping$.subscribe(
      (scraping: MultipleComicsScraping) => {
        this.scraping = scraping;
      }
    );
    this.store.dispatch(
      new ScrapingActions.MultipleComicsScrapingSetup({
        api_key: this.user_service.get_user_preference('api_key', '')
      })
    );
    this.selection_state_subscription = this.selection_state$.subscribe(
      (selection_state: SelectionState) => {
        this.selection_state = selection_state;

        this.selected_comics = [].concat(this.selection_state.selected_comics);
      }
    );
  }

  ngOnDestroy() {
    this.auth_subscription.unsubscribe();
    this.comics_subscription.unsubscribe();
    this.import_count_subscription.unsubscribe();
    this.rescan_count_subscription.unsubscribe();
    this.library_filter_subscription.unsubscribe();
  }

  delete_comic(comic: Comic): void {
    this.confirm_service.confirm({
      header: this.translate.instant('library.messages.delete-comic-title'),
      message: this.translate.instant('library.messages.delete-comic-question'),
      icon: 'fa fa-exclamation',
      accept: () => this.library_adaptor.delete_comics_by_id([comic.id])
    });
  }

  open_comic(comic: Comic): void {
    this.router.navigate(['comics', `${comic.id}`]);
  }

  rescan_library(): void {
    this.confirm_service.confirm({
      header: this.translate.instant('library.messages.rescan-library-title'),
      message: this.translate.instant(
        'library.messages.rescan-library-message'
      ),
      icon: 'fa fa-exclamation',
      accept: () => this.library_adaptor.start_rescan()
    });
  }

  can_rescan(): boolean {
    return this.import_count === 0 && this.rescan_count === 0;
  }
}
