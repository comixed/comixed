/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { selectAddingComicBooksState } from '@app/selectors/import-comic-books.selectors';

@Component({
  selector: 'cx-import-status-page',
  templateUrl: './import-status-page.component.html',
  styleUrls: ['./import-status-page.component.scss']
})
export class ImportStatusPageComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  comicImportStateSubscription: Subscription;

  importing = false;
  started = 0;
  total = 0;
  processed = 0;
  progress = 0;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.logger.debug('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.debug('Subscribing to comic import state updates');
    this.comicImportStateSubscription = this.store
      .select(selectAddingComicBooksState)
      .subscribe(state => {
        if (!state.active) {
          this.logger.debug(
            'No imports are active. Redirecting to import page'
          );
          this.router.navigateByUrl('/library/import');
        } else {
          this.importing = state.active;
          this.started = state.started;
          this.total = state.total;
          this.processed = state.processed;
          this.progress = (state.processed / state.total) * 100;
        }
      });
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from language updates');
    this.langChangeSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from comic import state updates');
    this.comicImportStateSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('comic-files.tab-title')
    );
  }
}
