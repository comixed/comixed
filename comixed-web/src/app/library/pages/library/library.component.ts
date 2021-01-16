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
import { Comic } from '@app/library';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  selectAllComics,
  selectLibraryBusy,
  selectSelectedComics
} from '@app/library/selectors/library.selectors';
import { TitleService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { isAdmin } from '@app/user/user.functions';

@Component({
  selector: 'cx-all-comics',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy {
  libraryBusySubscription: Subscription;
  comicSubscription: Subscription;
  selectedSubscription: Subscription;
  selected: Comic[] = [];
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  isAdmin = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService
  ) {
    this.libraryBusySubscription = this.store
      .select(selectLibraryBusy)
      .subscribe(busy => this.store.dispatch(setBusyState({ enabled: busy })));
    this.comicSubscription = this.store
      .select(selectAllComics)
      .subscribe(comics => (this.comics = comics));
    this.selectedSubscription = this.store
      .select(selectSelectedComics)
      .subscribe(selected => (this.selected = selected));
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Checking if user is admin:', user);
      this.isAdmin = isAdmin(user);
    });
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
    this._comics = comics;
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.libraryBusySubscription.unsubscribe();
    this.comicSubscription.unsubscribe();
    this.selectedSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.logger.trace('Setting page title');
    this.titleService.setTitle(
      this.translateService.instant('library.all-comics.title')
    );
  }
}
