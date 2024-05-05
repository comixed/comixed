/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { selectProcessingComicBooksState } from '@app/selectors/import-comic-books.selectors';
import { ProcessingComicStatus } from '@app/reducers/import-comic-books.reducer';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { QueryParameterService } from '@app/core/services/query-parameter.service';

@Component({
  selector: 'cx-processing-status-page',
  templateUrl: './processing-status-page.component.html',
  styleUrls: ['./processing-status-page.component.scss']
})
export class ProcessingStatusPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<ProcessingComicStatus>([]);

  readonly displayedColumns = [
    'batch-name',
    'step-name',
    'processed',
    'total',
    'progress'
  ];

  comicImportStateSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.debug('Subscribing to comic import state updates');
    this.comicImportStateSubscription = this.store
      .select(selectProcessingComicBooksState)
      .subscribe(state => (this.dataSource.data = state.batches));
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from comic import state updates');
    this.comicImportStateSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'batch-name':
          return data.batchName;
        case 'progress':
          return data.progress;
      }
    };
  }
}
