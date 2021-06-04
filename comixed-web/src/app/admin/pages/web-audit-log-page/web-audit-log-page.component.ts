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
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { WebAuditLogEntry } from '@app/admin/models/web-audit-log-entry';
import {
  selectWebAuditLogEntries,
  selectWebAuditLogState
} from '@app/admin/selectors/web-audit-log.selectors';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import {
  clearWebAuditLog,
  initializeWebAuditLog,
  loadWebAuditLogEntries
} from '@app/admin/actions/web-audit-log.actions';
import { MatSort } from '@angular/material/sort';
import { MatSidenav } from '@angular/material/sidenav';
import { ConfirmationService } from '@app/core/services/confirmation.service';

@Component({
  selector: 'cx-web-audit-log-page',
  templateUrl: './web-audit-log-page.component.html',
  styleUrls: ['./web-audit-log-page.component.scss']
})
export class WebAuditLogPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly displayedColumns = [
    'actions',
    'email',
    'remote-ip',
    'url',
    'method',
    'started',
    'bytes-received',
    'bytes-sent',
    'runtime',
    'success'
  ];

  langChangeSubscription: Subscription;
  logStateSubscription: Subscription;
  entrySubscription: Subscription;
  dataSource = new MatTableDataSource<WebAuditLogEntry>([]);
  content: any;
  contentTitle = '';

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logStateSubscription = this.store
      .select(selectWebAuditLogState)
      .subscribe(state => {
        this.logger.debug('state:', state);
        if (!state.loading) {
          this.logger.debug(
            'Fetching more web audit log entries:',
            state.latest
          );
          this.store.dispatch(
            loadWebAuditLogEntries({ timestamp: state.latest })
          );
        }
      });
    this.entrySubscription = this.store
      .select(selectWebAuditLogEntries)
      .subscribe(entries => (this.entries = entries));
  }

  set entries(entries: WebAuditLogEntry[]) {
    this.logger.debug('Received web audit log entries:', entries);
    this.dataSource.data = entries;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (element, property) => {
      switch (property) {
        case 'remote-ip':
          return element.remoteIp;
        case 'started':
          return `${element.startTime}`;
        default:
          return element[property];
      }
    };

    this.dataSource.sort = this.sort;
    this.loadTranslations();
  }

  ngOnInit(): void {
    this.logger.trace('Initial web audit log state');
    this.store.dispatch(initializeWebAuditLog());
  }

  ngOnDestroy(): void {
    this.logStateSubscription.unsubscribe();
    this.entrySubscription.unsubscribe();
  }

  onClearLog(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'web-audit-log.clear.confirmation-title'
      ),
      message: this.translateService.instant(
        'web-audit-log.clear.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Clearing web audit log');
        this.store.dispatch(clearWebAuditLog());
      }
    });
  }

  onShowResponseContent(entry: WebAuditLogEntry, webContent: MatSidenav): void {
    this.content = JSON.parse(entry.responseContent);
    this.contentTitle = 'web-audit-log.response-content-title';
    webContent.open();
  }

  onShowRequestContent(entry: WebAuditLogEntry, webContent: MatSidenav): void {
    this.content = JSON.parse(entry.requestContent);
    this.contentTitle = 'web-audit-log.request-content-title';
    webContent.open();
  }

  private loadTranslations(): void {
    this.logger.debug('Loading translations');
    this.paginator._intl.itemsPerPageLabel = this.translateService.instant(
      'web-audit-log.label.pagination-items-per-page'
    );
  }
}
