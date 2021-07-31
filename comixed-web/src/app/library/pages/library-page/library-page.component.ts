/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { Comic } from '@app/comic-book/models/comic';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  selectLibraryBusy,
  selectSelectedComics
} from '@app/library/selectors/library.selectors';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { isAdmin } from '@app/user/user.functions';
import { ActivatedRoute, Router } from '@angular/router';
import { selectComicList } from '@app/comic-book/selectors/comic-list.selectors';
import { LastRead } from '@app/last-read/models/last-read';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { last } from 'rxjs/operators';

@Component({
  selector: 'cx-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.scss']
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  libraryBusySubscription: Subscription;
  comicSubscription: Subscription;
  selectedSubscription: Subscription;
  selected: Comic[] = [];
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  isAdmin = false;
  currentTab = 0;
  dataSubscription: Subscription;
  unreadOnly = false;
  unscrapedOnly = false;
  deletedOnly = false;
  lastReadDatesSubscription: Subscription;
  lastReadDates: LastRead[];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.dataSubscription = this.activatedRoute.data.subscribe(data => {
      this.unreadOnly = !!data.unread && data.unread === true;
      this.unscrapedOnly = !!data.unscraped && data.unscraped === true;
      this.deletedOnly = !!data.deleted && data.deleted === true;
    });
    this.libraryBusySubscription = this.store
      .select(selectLibraryBusy)
      .subscribe(busy => this.store.dispatch(setBusyState({ enabled: busy })));
    this.comicSubscription = this.store
      .select(selectComicList)
      .subscribe(comics => (this.comics = comics));
    this.selectedSubscription = this.store
      .select(selectSelectedComics)
      .subscribe(selected => (this.selected = selected));
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Checking if user is admin:', user);
      this.isAdmin = isAdmin(user);
    });
    this.lastReadDatesSubscription = this.store
      .select(selectLastReadEntries)
      .subscribe(lastReadDates => (this.lastReadDates = lastReadDates));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  private _comics: Comic[] = [];

  get comics(): Comic[] {
    return this._comics;
  }

  set comics(comics: Comic[]) {
    this.logger.trace('Showing all comics:', comics);
    this._comics = comics.filter(
      comic =>
        (!this.unscrapedOnly || !comic.comicVineId) &&
        (!this.deletedOnly || !!comic.deletedDate)
    );
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    this.libraryBusySubscription.unsubscribe();
    this.comicSubscription.unsubscribe();
    this.selectedSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.logger.trace('Setting page title');
    if (this.deletedOnly) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-deleted')
      );
    } else if (this.unreadOnly) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-unread')
      );
    } else {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title')
      );
    }
  }
}
