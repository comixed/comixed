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

import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
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
import { Series } from '@app/collections/models/series';
import {
  selectPublisherCount,
  selectPublisherDetail,
  selectPublisherListBusy
} from '@app/collections/selectors/publisher.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadPublisherDetail } from '@app/collections/actions/publisher.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { AsyncPipe } from '@angular/common';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-publisher-series-page',
  templateUrl: './publisher-series-page.component.html',
  styleUrls: ['./publisher-series-page.component.scss'],
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
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    RouterLink,
    MatNoDataRow,
    AsyncPipe,
    TranslateModule
  ]
})
export class PublisherSeriesPageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Series>([]);

  readonly displayedColumns = [
    'series-name',
    'series-volume',
    'in-library',
    'total-issues'
  ];

  readonly pageOptions = PAGE_SIZE_OPTIONS;
  totalSeries$ = new BehaviorSubject(0);
  name$ = new BehaviorSubject('');

  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.name$.next(params['name']);
          this.doLoadData();
        })
      )
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(tap(params => this.doLoadData()))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.store
      .select(selectPublisherListBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectPublisherCount)
      .pipe(tap(count => this.totalSeries$.next(count)))
      .subscribe();
    this.store
      .select(selectPublisherDetail)
      .pipe(tap(detail => (this.dataSource.data = detail)))
      .subscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collections.publisher-series.tab-title', {
        name: this.name$.value
      })
    );
  }

  private doLoadData() {
    this.store.dispatch(
      loadPublisherDetail({
        name: this.name$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        pageSize: this.queryParameterService.pageSize$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }
}
