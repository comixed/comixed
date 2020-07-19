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
import { TaskAuditLogAdaptor } from 'app/backend-status/adaptors/task-audit-log.adaptor';
import { LibraryDisplayAdaptor } from 'app/user/adaptors/library-display.adaptor';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-task-audit-log-page',
  templateUrl: './task-audit-log-page.component.html',
  styleUrls: ['./task-audit-log-page.component.scss']
})
export class TaskAuditLogPageComponent implements OnInit, OnDestroy {
  fetchingSubscription: Subscription;
  fetching = false;
  entriesSubscription: Subscription;
  entries: TaskAuditLogEntry[] = [];
  rowsSubscription: Subscription;
  rows = 0;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private taskAuditLogAdaptor: TaskAuditLogAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private translateService: TranslateService,
    private titleService: Title
  ) {
    this.fetchingSubscription = this.taskAuditLogAdaptor.fetchingEntries$.subscribe(
      fetching => {
        this.fetching = fetching;
        if (fetching === false) {
          this.taskAuditLogAdaptor.getEntries();
        }
      }
    );
    this.entriesSubscription = this.taskAuditLogAdaptor.entries$.subscribe(
      entries => (this.entries = entries)
    );
    this.rowsSubscription = this.libraryDisplayAdaptor.rows$.subscribe(
      rows => (this.rows = rows)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.loadTranslations();
      }
    );
    this.loadTranslations();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.fetchingSubscription.unsubscribe();
    this.entriesSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
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
}
