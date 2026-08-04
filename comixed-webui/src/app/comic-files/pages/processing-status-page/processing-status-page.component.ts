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

import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { selectProcessingComicBooksState } from '@app/selectors/import-comic-books.selectors';
import { ProcessingComicStatus } from '@app/reducers/import-comic-books.reducer';
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
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressBar } from '@angular/material/progress-bar';
import { AsyncPipe } from '@angular/common';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'cx-processing-status-page',
  templateUrl: './processing-status-page.component.html',
  styleUrls: ['./processing-status-page.component.scss'],
  imports: [
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatProgressBar,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    AsyncPipe,
    TranslateModule
  ]
})
export class ProcessingStatusPageComponent implements AfterViewInit, OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<ProcessingComicStatus>([]);
  readonly displayedColumns = ['step-name', 'processed', 'total', 'progress'];

  logger = inject(LoggerService);
  store = inject(Store);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.store
      .select(selectProcessingComicBooksState)
      .pipe(tap(state => (this.dataSource.data = state.batches)))
      .subscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'progress':
          return data.progress;
        case 'step-name':
        default:
          return data.stepName;
      }
    };
  }

  private loadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('processing-status-page.tab-title')
    );
  }
}
