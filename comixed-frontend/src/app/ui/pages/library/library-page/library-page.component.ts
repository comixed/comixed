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
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Library } from 'app/models/actions/library';
import * as LibraryActions from 'app/actions/library.actions';
import { LibraryFilter } from 'app/models/actions/library-filter';
import * as FilterActions from 'app/actions/library-filter.actions';
import { MultipleComicsScraping } from 'app/models/scraping/multiple-comics-scraping';
import * as ScrapingActions from 'app/actions/multiple-comics-scraping.actions';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Comic } from 'app/models/comics/comic';
import * as UserActions from 'app/actions/user.actions';
import { User } from 'app/models/user/user';
import { Preference } from 'app/models/user/preference';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.css']
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  private user$: Observable<User>;
  private user_subscription: Subscription;
  user: User;

  private library$: Observable<Library>;
  private library_subscription: Subscription;
  library: Library;

  private library_filter$: Observable<LibraryFilter>;
  private library_filter_subscription: Subscription;
  library_filter: LibraryFilter;

  scraping$: Observable<MultipleComicsScraping>;
  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;

  comics: Array<Comic> = [];
  selected_comics: Array<Comic> = [];

  constructor(
    private router: Router,
    private user_service: UserService,
    private comic_service: ComicService,
    private confirm_service: ConfirmationService,
    private store: Store<AppState>,
    private translate: TranslateService
  ) {
    this.user$ = store.select('user');
    this.library$ = store.select('library');
    this.library_filter$ = store.select('library_filter');
    this.scraping$ = store.select('multiple_comic_scraping');
  }

  ngOnInit() {
    this.user_subscription = this.user$.subscribe((user: User) => {
      this.user = user;
    });
    this.library_subscription = this.library$.subscribe((library: Library) => {
      this.library = library;

      this.comics = [].concat(this.library.comics);
      this.selected_comics = [].concat(this.library.selected_comics);
    });
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
  }

  ngOnDestroy() {
    this.user_subscription.unsubscribe();
    this.library_subscription.unsubscribe();
    this.library_filter_subscription.unsubscribe();
  }

  delete_comic(comic: Comic): void {
    this.confirm_service.confirm({
      header: this.translate.instant('library.messages.delete-comic-title'),
      message: this.translate.instant('library.messages.delete-comic-question'),
      icon: 'fa fa-exclamation',
      accept: () => {
        this.store.dispatch(
          new LibraryActions.LibraryRemoveComic({ comic: comic })
        );
      }
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
      accept: () => {
        this.store.dispatch(
          new LibraryActions.LibraryRescanFiles({
            last_comic_date: this.library.last_comic_date
          })
        );
      }
    });
  }

  can_rescan(): boolean {
    return (
      this.library.library_state.rescan_count === 0 &&
      this.library.library_state.import_count === 0
    );
  }
}
