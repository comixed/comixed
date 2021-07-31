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

import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import { Subscription } from 'rxjs';
import { TaskAuditLogEntry } from '@app/admin/models/task-audit-log-entry';
import {
  loadTaskAuditLogEntries,
  resetTaskAuditLog
} from '@app/admin/actions/task-audit-log.actions';
import {
  selectTaskAuditLogEntries,
  selectTaskAuditLogState
} from '@app/admin/selectors/task-audit-log.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { filter } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'cx-task-audit-log-page',
  templateUrl: './task-audit-log-page.component.html',
  styleUrls: ['./task-audit-log-page.component.scss']
})
export class TaskAuditLogPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  langChangeSubscription: Subscription;
  entryStateSubscription: Subscription;
  entrySubscription: Subscription;
  dataSource = new MatTableDataSource<TaskAuditLogEntry>([]);
  currentEntry: TaskAuditLogEntry = null;

  readonly displayColumns = [
    'task-type',
    'start-time',
    'runtime',
    'successful',
    'description'
  ];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.logger.trace('Language changed');
        this.loadTranslations();
      }
    );
    this.entryStateSubscription = this.store
      .select(selectTaskAuditLogState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
        if (!state.loading && !state.lastPage) {
          this.logger.debug('Firing action to load task audit log entries');
          this.store.dispatch(
            loadTaskAuditLogEntries({ latest: state.latest })
          );
        }
      });
    this.entrySubscription = this.store
      .select(selectTaskAuditLogEntries)
      .subscribe(entries => (this.entries = entries));
  }

  set entries(entries: TaskAuditLogEntry[]) {
    this.dataSource.data = entries;
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.store.dispatch(resetTaskAuditLog());
  }

  ngOnDestroy(): void {
    this.entryStateSubscription.unsubscribe();
    this.entrySubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, property) => {
      switch (property) {
        case 'task-type':
          return data.taskType;
        case 'start-time':
          return data.startTime;
        case 'runtime':
          return data.endTime - data.startTime;
        case 'successful':
          return `${data.successful}`;
      }
    };
    this.dataSource.paginator = this.paginator;
  }

  onEntrySelected(row: TaskAuditLogEntry): void {
    this.logger.debug('Toggling task description:', row);
    if (this.currentEntry?.id === row.id) {
      this.currentEntry = null;
    } else {
      this.currentEntry = row;
    }
  }

  toJSON(text: string): any {
    if (!!text) {
      return JSON.parse(text);
    }
    return {};
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('task-audit-log.tab-title')
    );
  }
}
