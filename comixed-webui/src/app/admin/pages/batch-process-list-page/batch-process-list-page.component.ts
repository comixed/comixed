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
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { MatTableDataSource } from '@angular/material/table';
import { BatchProcess } from '@app/admin/models/batch-process';
import { Subscription } from 'rxjs';
import {
  selectBatchProcessesState,
  selectBatchProcessList
} from '@app/admin/selectors/batch-processes.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { Store } from '@ngrx/store';
import { loadBatchProcessList } from '@app/admin/actions/batch-processes.actions';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';

@Component({
  selector: 'cx-batch-process-list-page',
  templateUrl: './batch-process-list-page.component.html',
  styleUrls: ['./batch-process-list-page.component.scss']
})
export class BatchProcessListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<BatchProcess>([]);

  batchProcessStateSubscription: Subscription;
  batchProcessListSubscription: Subscription;
  readonly displayedColumns = [
    'name',
    'job-id',
    'status',
    'start-time',
    'end-time',
    'exit-code',
    'exit-description'
  ];

  langChangeSubscription: Subscription;
  protected readonly PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private translateService: TranslateService,
    private titleService: TitleService,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.debug('Subscribing to batch process state updates');
    this.batchProcessStateSubscription = this.store
      .select(selectBatchProcessesState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.busy }));
      });
    this.logger.debug('Subscribing to batch process list updates');
    this.batchProcessListSubscription = this.store
      .select(selectBatchProcessList)
      .subscribe(list => (this.dataSource.data = list));
    this.logger.debug('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
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
        case 'name':
          return data.name;
        case 'job-id':
          return data.jobId;
        case 'status':
          return data.status;
        case 'start-time':
          return data.startTime;
        case 'end-time':
          return data.endTime;
        case 'exit-code':
          return data.exitCode;
        default:
          this.logger.error('No such column:', sortHeaderId);
          return null;
      }
    };
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
