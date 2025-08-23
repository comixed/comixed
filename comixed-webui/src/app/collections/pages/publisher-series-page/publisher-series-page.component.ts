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

import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
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
import { Series } from '@app/collections/models/series';
import {
  selectPublisherDetail,
  selectPublisherState
} from '@app/collections/selectors/publisher.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadPublisherDetail } from '@app/collections/actions/publisher.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_OPTIONS } from '@app/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { AsyncPipe } from '@angular/common';

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
export class PublisherSeriesPageComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Series>([]);
  paramSubscription: Subscription;
  queryParamSubscription: Subscription;
  langChangeSubscription: Subscription;
  publisherStateSubscription: Subscription;
  publisherDetailSubscription: Subscription;
  totalSeries = 0;

  readonly displayedColumns = [
    'series-name',
    'series-volume',
    'in-library',
    'total-issues'
  ];
  readonly pageOptions = PAGE_SIZE_OPTIONS;
  pageIndex = 0;
  pageSize = PAGE_SIZE_DEFAULT;
  name: string;

  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.logger.trace('Subscribing to parameter updates');
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.name = params['name'];
      this.doLoadData();
    });
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => this.doLoadData()
    );
    this.logger.trace('Subscribing to language updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to publisher state updates');
    this.publisherStateSubscription = this.store
      .select(selectPublisherState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.busy }));
        this.totalSeries = state.totalSeries;
      });
    this.logger.trace('Subscribing to publisher detail updates');
    this.publisherDetailSubscription = this.store
      .select(selectPublisherDetail)
      .subscribe(detail => (this.dataSource.data = detail));
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from parameter updates');
    this.paramSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from query parameter updates');
    this.queryParamSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from publisher state updates');
    this.publisherStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from publisher detail updates');
    this.publisherDetailSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collections.publisher-series.tab-title', {
        name: this.name
      })
    );
  }

  private doLoadData() {
    this.store.dispatch(
      loadPublisherDetail({
        name: this.name,
        pageIndex: this.queryParameterService.pageIndex$.value,
        pageSize: this.queryParameterService.pageSize$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }
}
