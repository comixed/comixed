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

import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MetadataAuditLogEntry } from '@app/comic-metadata/models/metadata-audit-log-entry';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  selectMetadataAuditLogEntries,
  selectMetadataAuditLogState
} from '@app/comic-metadata/selectors/metadata-audit-log.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import {
  clearMetadataAuditLog,
  loadMetadataAuditLog
} from '@app/comic-metadata/actions/metadata-audit-log.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';
import { saveUserPreference } from '@app/user/actions/user.actions';

@Component({
  selector: 'cx-metadata-audit-log-list',
  templateUrl: './metadata-audit-log-list.component.html',
  styleUrls: ['./metadata-audit-log-list.component.scss']
})
export class MetadataAuditLogListComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  readonly displayedColumns = ['created-on', 'metadata-source', 'comic'];

  userSubscription: Subscription;
  pageSize = PAGE_SIZE_DEFAULT;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  auditLogStateSubscription: Subscription;
  auditLogSubscription: Subscription;
  dataSource = new MatTableDataSource<MetadataAuditLogEntry>([]);

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Subscribing to user preferences');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Loading user page size preference');
      this.pageSize = parseInt(
        getUserPreference(
          user.preferences,
          PAGE_SIZE_PREFERENCE,
          `${PAGE_SIZE_DEFAULT}`
        )
      );
    });
    this.logger.trace('Subscribing to audit log state updates');
    this.auditLogStateSubscription = this.store
      .select(selectMetadataAuditLogState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscribing to audit log entry updates');
    this.auditLogSubscription = this.store
      .select(selectMetadataAuditLogEntries)
      .subscribe(entries => (this.dataSource.data = entries));
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting paginator');
    this.dataSource.paginator = this.paginator;
    this.logger.trace('Setting entry sorting');
    this.dataSource.sort = this.sort;
    this.logger.trace('Setting sorting data accessor');
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'created-on':
          return data.createdOn;
        case 'metadata-source':
          return data.metadataSource.name;
        case 'comic':
          return data.comic.series;
      }
    };
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from metadata audit log state updates');
    this.auditLogStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from metadata audit log updates');
    this.auditLogSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading metadata audit log');
    this.store.dispatch(loadMetadataAuditLog());
  }

  onReloadEntries(): void {
    this.logger.trace('Reloading metadata audit log entries');
    this.store.dispatch(loadMetadataAuditLog());
  }

  onClearEntries(): void {
    this.logger.trace('Confirming clear metadata audit log');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata-audit-log.clear-entries.confirm-title'
      ),
      message: this.translateService.instant(
        'metadata-audit-log.clear-entries.confirm-message'
      ),
      confirm: () => {
        this.logger.trace('Clearing metadata audit log');
        this.store.dispatch(clearMetadataAuditLog());
      }
    });
  }

  onPageChange(pageEvent: PageEvent): void {
    this.logger.trace('Saving preferred page size');
    this.store.dispatch(
      saveUserPreference({
        name: PAGE_SIZE_PREFERENCE,
        value: `${pageEvent.pageSize}`
      })
    );
  }
}
