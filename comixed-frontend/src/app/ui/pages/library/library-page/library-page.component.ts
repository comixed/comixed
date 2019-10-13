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
import { Comic, LibraryAdaptor, SelectionAdaptor } from 'app/library';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor, User } from 'app/user';
import { Title } from '@angular/platform-browser';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.scss']
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  authSubscription: Subscription;
  user: User;
  comicsSubscription: Subscription;
  comics: Comic[] = [];
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[] = [];
  rescanCount = 0;
  rescanCountSubscription: Subscription;
  importCount = 0;
  importCountSubscription: Subscription;
  langChangeSubscription: Subscription;

  private library_filter$: Observable<LibraryFilter>;

  private library_filter_subscription: Subscription;
  library_filter: LibraryFilter;
  scraping$: Observable<MultipleComicsScraping>;

  scraping_subscription: Subscription;
  scraping: MultipleComicsScraping;

  constructor(
    private titleService: Title,
    private router: Router,
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private userService: UserService,
    private comicService: ComicService,
    private confirmationService: ConfirmationService,
    private store: Store<AppState>,
    private translateService: TranslateService,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {
    this.library_filter$ = store.select('library_filter');
    this.scraping$ = store.select('multiple_comic_scraping');
  }

  ngOnInit() {
    this.authSubscription = this.authenticationAdaptor.user$.subscribe(
      user => (this.user = user)
    );
    this.comicsSubscription = this.libraryAdaptor.comic$.subscribe(comics => {
      this.comics = comics;
      this.titleService.setTitle(
        this.translateService.instant('library-page.title', {
          count: this.comics.length
        })
      );
    });
    this.selectedComicsSubscription = this.selectionAdaptor.comic_selection$.subscribe(
      selected_comics => (this.selectedComics = selected_comics)
    );
    this.importCountSubscription = this.libraryAdaptor.processingCount$.subscribe(
      import_count => (this.importCount = import_count)
    );
    this.rescanCountSubscription = this.libraryAdaptor.rescanCount$.subscribe(
      rescan_count => (this.rescanCount = rescan_count)
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
        api_key: this.userService.get_user_preference('api_key', '')
      })
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.comicsSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.importCountSubscription.unsubscribe();
    this.rescanCountSubscription.unsubscribe();
    this.library_filter_subscription.unsubscribe();
  }

  delete_comic(comic: Comic): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'library.messages.delete-comic-title'
      ),
      message: this.translateService.instant(
        'library.messages.delete-comic-question'
      ),
      icon: 'fa fa-exclamation',
      accept: () => this.libraryAdaptor.deleteComics([comic.id])
    });
  }

  open_comic(comic: Comic): void {
    this.router.navigate(['comics', `${comic.id}`]);
  }

  rescan_library(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'library.messages.rescan-library-title'
      ),
      message: this.translateService.instant(
        'library.messages.rescan-library-message'
      ),
      icon: 'fa fa-exclamation',
      accept: () => this.libraryAdaptor.startRescan()
    });
  }

  can_rescan(): boolean {
    return this.importCount === 0 && this.rescanCount === 0;
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.library-page') }
    ]);
  }
}
