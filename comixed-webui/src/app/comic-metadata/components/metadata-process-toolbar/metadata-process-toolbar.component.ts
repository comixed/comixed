/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { Component, Input, OnDestroy } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { startMetadataUpdateProcess } from '@app/comic-metadata/actions/single-book-scraping.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { SKIP_CACHE_PREFERENCE } from '@app/library/library.constants';
import { Subscription } from 'rxjs';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'cx-metadata-process-toolbar',
  templateUrl: './metadata-process-toolbar.component.html',
  styleUrls: ['./metadata-process-toolbar.component.scss']
})
export class MetadataProcessToolbarComponent implements OnDestroy {
  @Input() selectedIds: number[] = [];
  userSubscription: Subscription;
  skipCache = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Subscribing to user updates');
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.skipCache =
          getUserPreference(
            user.preferences || [],
            SKIP_CACHE_PREFERENCE,
            `${false}`
          ) === `${true}`;
      });
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
  }

  onStartBatchProcess(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-process.start-process.confirm-title'
      ),
      message: this.translateService.instant(
        'metadata-process.start-process.confirm-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.trace('Starting the metadata batch processing');
        this.store.dispatch(
          startMetadataUpdateProcess({
            skipCache: this.skipCache
          })
        );
      }
    });
  }

  onToggleSkipCache(): void {
    this.logger.trace('Saving skip cache preference:', !this.skipCache);
    this.store.dispatch(
      saveUserPreference({
        name: SKIP_CACHE_PREFERENCE,
        value: `${!this.skipCache}`
      })
    );
  }
}
