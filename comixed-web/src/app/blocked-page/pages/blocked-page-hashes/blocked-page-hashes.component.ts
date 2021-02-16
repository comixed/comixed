/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectBlockedPageHashes } from '@app/blocked-page/selectors/blocked-page.selectors';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';
import { TitleService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cx-blocked-page-hashes',
  templateUrl: './blocked-page-hashes.component.html',
  styleUrls: ['./blocked-page-hashes.component.scss']
})
export class BlockedPageHashesComponent implements OnInit, OnDestroy {
  hashSubscription: Subscription;
  hashes = [];
  userSubscription: Subscription;
  imageHeight = PAGE_SIZE_DEFAULT;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService
  ) {
    this.translateService.onLangChange.subscribe(() => this.loadTranslations());
    this.hashSubscription = this.store
      .select(selectBlockedPageHashes)
      .subscribe(hashes => (this.hashes = hashes));
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.imageHeight = parseInt(
        getUserPreference(
          user.preferences,
          PAGE_SIZE_PREFERENCE,
          `${this.imageHeight}`
        ),
        10
      );
    });
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.hashSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('blocked-pages.page-title')
    );
  }
}
