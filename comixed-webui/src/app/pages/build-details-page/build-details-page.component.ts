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

import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CurrentRelease } from '@app/models/current-release';
import {
  selectReleaseDetailsCurrentRelease,
  selectReleaseDetailsNotLoaded
} from '@app/selectors/release.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadCurrentReleaseDetails } from '@app/actions/release.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  MatCard,
  MatCardActions,
  MatCardContent
} from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe, DatePipe } from '@angular/common';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-build-details',
  templateUrl: './build-details-page.component.html',
  styleUrls: ['./build-details-page.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    MatIconButton,
    MatTooltip,
    MatIcon,
    DatePipe,
    TranslateModule,
    AsyncPipe
  ]
})
export class BuildDetailsPageComponent implements OnInit {
  details$ = new BehaviorSubject<CurrentRelease | null>(null);

  private logger = inject(LoggerService);
  private store = inject(Store);
  private translateService = inject(TranslateService);
  private titleService = inject(TitleService);
  private clipboard = inject(Clipboard);

  constructor() {
    this.store
      .select(selectReleaseDetailsNotLoaded)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectReleaseDetailsCurrentRelease)
      .pipe(tap(current => this.details$.next(current)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
  }

  ngOnInit(): void {
    this.store.dispatch(loadCurrentReleaseDetails());
    this.loadTranslations();
  }

  copyToClipboard(): void {
    this.clipboard.copy(
      `
${this.translateService.instant('build-details.label.branch', {
  name: this.details$.value.branch
})}
${this.translateService.instant('build-details.label.build-time', {
  time: this.details$.value.buildTime
})}
${this.translateService.instant('build-details.label.build-host', {
  name: this.details$.value.buildHost
})}
${this.translateService.instant('build-details.label.build-version', {
  version: this.details$.value.buildVersion
})}
${this.translateService.instant('build-details.label.commit-time', {
  time: this.details$.value.commitTime
})}
${this.translateService.instant('build-details.label.dirty', {
  name: this.details$.value.dirty
})}
${this.translateService.instant('build-details.label.remote-origin-url', {
  url: this.details$.value.remoteOriginURL
})}
${this.translateService.instant('build-details.label.jdbc-url', {
  url: this.details$.value.jdbcUrl
})}
${this.translateService.instant('build-details.label.java-runtime', {
  version: this.details$.value.javaVersion,
  vendor: this.details$.value.javaVendor,
  osName: this.details$.value.osName,
  osArch: this.details$.value.osArch,
  osVersion: this.details$.value.osVersion
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
