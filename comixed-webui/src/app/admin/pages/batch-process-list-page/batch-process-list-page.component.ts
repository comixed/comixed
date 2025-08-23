/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
  MatNoDataRow
} from '@angular/material/table';
import { Subscription } from 'rxjs';
import {
  selectBatchProcessesState,
  selectBatchProcessList
} from '@app/admin/selectors/batch-processes.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { Store } from '@ngrx/store';
import {
  deleteCompletedBatchJobs,
  deleteSelectedBatchJobs,
  loadBatchProcessList
} from '@app/admin/actions/batch-processes.actions';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { BatchProcessDetail } from '@app/admin/models/batch-process-detail';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'cx-batch-process-list-page',
  templateUrl: './batch-process-list-page.component.html',
  styleUrls: ['./batch-process-list-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCheckbox,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    RouterLink,
    MatNoDataRow,
    AsyncPipe,
    DatePipe,
    TranslateModule
  ]
})
export class BatchProcessListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<SelectableListItem<BatchProcessDetail>>(
    []
  );

  batchProcessStateSubscription: Subscription;
  batchProcessListSubscription: Subscription;
  readonly displayedColumns = [
    'selection',
    'job-name',
    'job-id',
    'running',
    'start-time',
    'end-time',
    'status',
    'exit-code',
    'exit-description'
  ];

  langChangeSubscription: Subscription;
  detail: BatchProcessDetail | null = null;
  anySelected = false;
  allSelected = false;
  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  store = inject(Store);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  confirmationService = inject(ConfirmationService);

  constructor() {
    this.logger.debug('Subscribing to batch process state updates');
    this.batchProcessStateSubscription = this.store
      .select(selectBatchProcessesState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.busy }));
      });
    this.logger.debug('Subscribing to batch process list updates');
    this.batchProcessListSubscription = this.store
      .select(selectBatchProcessList)
      .subscribe(list => (this.batchList = list));
    this.logger.debug('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  set batchList(batchList: BatchProcessDetail[]) {
    const oldList = this.dataSource.data;
    this.dataSource.data = batchList.map(item => {
      const oldEntry = oldList.find(entry => entry.item.jobId === item.jobId);
      return {
        item,
        selected: oldEntry?.selected || false
      };
    });
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from batch process state updates');
    this.batchProcessStateSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from batch process list updates');
    this.batchProcessListSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.doLoadBatchProcessList();
    this.loadTranslations();
  }

  ngAfterViewInit(): void {
    this.logger.debug('Adding table pagination');
    this.dataSource.paginator = this.paginator;
    this.logger.debug('Adding table sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'selection':
          return `${data.selected}`;
        case 'job-name':
          return data.item.jobName;
        case 'status':
          return data.item.status;
        case 'start-time':
          return data.item.startTime;
        case 'end-time':
          return data.item.endTime;
        case 'exit-code':
          return data.item.exitStatus;
        case 'job-id':
        default:
          return data.item.jobId;
      }
    };
  }

  onDeleteCompletedJobs(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'batch-processes.delete-completed-jobs.confirmation-title'
      ),
      message: this.translateService.instant(
        'batch-processes.delete-completed-jobs.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Deleted completed batch jobs:', this.detail);
        this.store.dispatch(deleteCompletedBatchJobs());
      }
    });
  }

  onSelectOne(
    entry: SelectableListItem<BatchProcessDetail>,
    selected: boolean
  ): void {
    entry.selected = selected;
    this.updateSelections();
  }

  onSelectAll(selected: boolean): void {
    this.dataSource.data.forEach(entry => (entry.selected = selected));
    this.updateSelections();
  }

  onDeleteSelectedJobs(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'batch-processes.delete-selected-jobs.confirmation-title'
      ),
      message: this.translateService.instant(
        'batch-processes.delete-selected-jobs.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Deleted selected batch jobs:', this.detail);
        this.store.dispatch(
          deleteSelectedBatchJobs({
            jobIds: this.dataSource.data
              .filter(entry => entry.selected)
              .map(entry => entry.item.jobId)
          })
        );
      }
    });
  }

  private updateSelections(): void {
    this.anySelected = this.dataSource.data.some(entry => entry.selected);
    this.allSelected = this.dataSource.data.every(entry => entry.selected);
  }

  private doLoadBatchProcessList(): void {
    this.logger.debug('Loading batch process list');
    this.store.dispatch(loadBatchProcessList());
  }

  private loadTranslations(): void {
    this.logger.debug('Loading translations');
    this.titleService.setTitle(
      this.translateService.instant(
        'batch-processes.batch-process-list.tab-title'
      )
    );
  }
}
