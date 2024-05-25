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
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { TitleService } from '@app/core/services/title.service';
import { Store } from '@ngrx/store';
import { LastRead } from '@app/comic-books/models/last-read';
import { selectLastReadListState } from '@app/comic-books/selectors/last-read-list.selectors';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'cx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  loading = false;
  taskCount = 0;

  libraryStateSubscription: Subscription;
  libraryState: LibraryState = null;
  lastReadStateSubscription: Subscription;
  lastRead: LastRead[] = [];

  constructor(
    private logger: LoggerService,
    private titleService: TitleService,
    private translateService: TranslateService,
    private store: Store<any>
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.libraryStateSubscription = this.store
      .select(selectLibraryState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.logger.debug('Library state updated:', state);
        this.libraryState = state;
      });
    this.lastReadStateSubscription = this.store
      .select(selectLastReadListState)
      .subscribe(state => {
        this.lastRead = state.entries;
      });
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from last read updates');
    this.lastReadStateSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.logger.trace('Loading translations');
    this.titleService.setTitle(this.translateService.instant('home.tab-title'));
  }
}
