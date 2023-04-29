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
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { CurrentRelease } from '@app/models/current-release';
import { selectReleaseDetailsState } from '@app/selectors/release.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadCurrentReleaseDetails } from '@app/actions/release.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'cx-build-details',
  templateUrl: './build-details.component.html',
  styleUrls: ['./build-details.component.scss']
})
export class BuildDetailsComponent implements OnInit, OnDestroy {
  detailsSubscription: Subscription;
  details: CurrentRelease;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private translateService: TranslateService,
    private titleService: TitleService,
    private clipboard: Clipboard
  ) {
    this.detailsSubscription = this.store
      .select(selectReleaseDetailsState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.currentLoading }));
        this.details = state.current;
      });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  ngOnInit(): void {
    this.store.dispatch(loadCurrentReleaseDetails());
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
  }

  copyToClipboard(): void {
    this.clipboard.copy(
      `
${this.translateService.instant('build-details.label.branch', {
  name: this.details.branch
})}
${this.translateService.instant('build-details.label.build-time', {
  time: this.details.buildTime
})}
${this.translateService.instant('build-details.label.build-host', {
  time: this.details.buildHost
})}
${this.translateService.instant('build-details.label.build-version', {
  time: this.details.buildVersion
})}
${this.translateService.instant('build-details.label.commit-id', {
  time: this.details.commitId
})}
${this.translateService.instant('build-details.label.comit-time', {
  time: this.details.commitTime
})}
${this.translateService.instant('build-details.label.commit-message', {
  time: this.details.commitMessage
})}
${this.translateService.instant('build-details.label.commit-user', {
  time: this.details.commitUser
})}
${this.translateService.instant('build-details.label.dirty', {
  time: this.details.dirty
})}
${this.translateService.instant('build-details.label.remote-origin-url', {
  time: this.details.remoteOriginURL
})}
${this.translateService.instant('build-details.label.jdbcUrl', {
  time: this.details.jdbcUrl
})}`
    );
  }

  private loadTranslations(): void {
    this.logger.trace('Setting tab title');
    this.titleService.setTitle(
      this.translateService.instant('build-details.tab-title')
    );
  }
}
