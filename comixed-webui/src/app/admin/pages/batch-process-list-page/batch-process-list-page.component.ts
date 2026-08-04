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
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  selectBatchProcessesBusy,
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { tap } from 'rxjs/operators';

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
export class BatchProcessListPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<SelectableListItem<BatchProcessDetail>>(
    []
  );

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

  anySelected$ = new BehaviorSubject(false);
  allSelected$ = new BehaviorSubject(false);
  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  store = inject(Store);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  confirmationService = inject(ConfirmationService);

  constructor() {
    this.store
      .select(selectBatchProcessesBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectBatchProcessList)
      .pipe(tap(batchList => (this.batchList = batchList)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
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
        this.logger.debug('Deleting completed batch jobs');
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
        this.logger.debug('Deleted selected batch jobs');
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
    this.anySelected$.next(this.dataSource.data.some(entry => entry.selected));
    this.allSelected$.next(this.dataSource.data.every(entry => entry.selected));
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
