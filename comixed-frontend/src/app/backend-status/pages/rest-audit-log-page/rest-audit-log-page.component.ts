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
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { AppState } from 'app/backend-status';
import {
  selectLoadRestAuditLogEntries,
  selectLoadRestAuditLogLoading,
  selectLoadRestAuditLogState
} from 'app/backend-status/selectors/load-rest-audit-log.selectors';
import {
  getRestAuditLogEntries,
  startLoadingRestAuditLogEntries,
  stopGettingRestAuditLogEntries
} from 'app/backend-status/actions/load-rest-audit-log.actions';
import { RestAuditLogEntry } from 'app/backend-status/models/rest-audit-log-entry';
import { Subscription } from 'rxjs';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-rest-audit-log-page',
  templateUrl: './rest-audit-log-page.component.html',
  styleUrls: ['./rest-audit-log-page.component.scss']
})
export class RestAuditLogPageComponent implements OnInit, OnDestroy {
  stateSubscription: Subscription;
  entriesSubscription: Subscription;
  entries: RestAuditLogEntry[] = [];
  currentEntry: RestAuditLogEntry = null;
  showDetailsDialog = false;
  loadingSubscription: Subscription;
  loading = false;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<AppState>,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private translateService: TranslateService,
    private titleService: Title
  ) {
    this.stateSubscription = this.store
      .select(selectLoadRestAuditLogState)
      .subscribe(state => {
        if (!state.loading && !state.stopped) {
          this.logger.debug(
            `Fetching REST audit log entries since ${state.latest}`
          );
          this.store.dispatch(getRestAuditLogEntries({ cutoff: state.latest }));
        }
      });
    this.entriesSubscription = this.store
      .select(selectLoadRestAuditLogEntries)
      .subscribe(entries => {
        this.logger.debug('Received REST audit log entries:', entries);
        this.entries = entries;
      });
    this.loadingSubscription = this.store
      .select(selectLoadRestAuditLogLoading)
      .subscribe(loading => (this.loading = loading));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.loadTranslations();
      }
    );
    this.loadTranslations();
  }

  ngOnInit() {
    this.store.dispatch(startLoadingRestAuditLogEntries());
  }

  ngOnDestroy() {
    this.store.dispatch(stopGettingRestAuditLogEntries());
    this.stateSubscription.unsubscribe();
    this.entriesSubscription.unsubscribe();
    this.loadingSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('backend-status.rest-audit-log.page-title')
    );
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.admin.root') },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.admin.rest-audit-log'
        )
      }
    ]);
  }

  /**
   * Displays the details dialog.
   *
   * @param entry the entry to be shown
   */
  showEntryDetails(entry: RestAuditLogEntry): void {
    this.currentEntry = entry;
    this.showDetailsDialog =
      !!entry.requestContent || !!entry.responseContent || !!entry.exception;
  }

  /**
   * Hides the details dialog.
   */
  hideEntryDetails() {
    this.showDetailsDialog = false;
    this.currentEntry = null;
  }

  asJson(content: string) {
    return JSON.parse(content);
  }
}
