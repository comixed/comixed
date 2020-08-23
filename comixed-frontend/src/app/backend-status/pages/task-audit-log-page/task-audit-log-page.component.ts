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
import { Subscription } from 'rxjs';
import { TaskAuditLogEntry } from 'app/backend-status/models/task-audit-log-entry';
import { LoggerService } from '@angular-ru/logger';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { ConfirmationService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { AppState } from 'app/backend-status';
import { clearTaskAuditLog } from 'app/backend-status/actions/clear-task-audit-log.actions';
import { selectClearTaskingAuditLogWorking } from 'app/backend-status/selectors/clear-task-audit-log.selectors';
import {
  selectLoadTaskAuditLogState,
  selectTaskAuditLogEntries
} from 'app/backend-status/selectors/load-task-audit-log.selectors';
import {
  loadTaskAuditLogEntries,
  startLoadingTaskAuditLogEntries
} from 'app/backend-status/actions/load-task-audit-log.actions';
import { LoadTaskAuditLogState } from 'app/backend-status/reducers/load-task-audit-log.reducer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-task-audit-log-page',
  templateUrl: './task-audit-log-page.component.html',
  styleUrls: ['./task-audit-log-page.component.scss']
})
export class TaskAuditLogPageComponent implements OnInit, OnDestroy {
  taskAuditLogStateSubscription: Subscription;
  entriesSubscription: Subscription;
  entries: TaskAuditLogEntry[] = [];
  clearingAuditLogSubscription: Subscription;
  clearingAuditLog = false;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private translateService: TranslateService,
    private titleService: Title,
    private confirmationService: ConfirmationService,
    private store: Store<AppState>
  ) {
    this.taskAuditLogStateSubscription = this.store
      .select(selectLoadTaskAuditLogState)
      .pipe(filter(state => !!state))
      .subscribe((state: LoadTaskAuditLogState) => {
        if (!state.loading && !state.stopped) {
          this.logger.trace('Fetching task audit log entries');
          this.store.dispatch(loadTaskAuditLogEntries({ since: state.latest }));
        }
      });
    this.entriesSubscription = this.store
      .select(selectTaskAuditLogEntries)
      .pipe(filter(state => !!state))
      .subscribe(entries => (this.entries = entries));
    this.clearingAuditLogSubscription = this.store
      .select(selectClearTaskingAuditLogWorking)
      .pipe(filter(state => !!state))
      .subscribe(clearing => (this.clearingAuditLog = clearing));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.loadTranslations();
      }
    );
    this.loadTranslations();
  }

  ngOnInit() {
    this.store.dispatch(startLoadingTaskAuditLogEntries());
  }

  ngOnDestroy() {
    this.taskAuditLogStateSubscription.unsubscribe();
    this.entriesSubscription.unsubscribe();
    this.clearingAuditLogSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('task-audit-log-page.title')
    );
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.admin.root') },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.admin.task-audit-log'
        )
      }
    ]);
  }

  doClearAuditLog() {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'task.clear-audit-log.confirm-header'
      ),
      message: this.translateService.instant(
        'task.clear-audit-log.confirm-message'
      ),
      accept: () => this.store.dispatch(clearTaskAuditLog())
    });
  }
}
