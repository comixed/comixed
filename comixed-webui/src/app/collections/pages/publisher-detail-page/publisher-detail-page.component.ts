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
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Series } from '@app/collections/models/series';
import {
  selectPublisherDetail,
  selectPublisherState
} from '@app/collections/selectors/publisher.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadPublisherDetail } from '@app/collections/actions/publisher.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_OPTIONS } from '@app/core';

@Component({
  selector: 'cx-publisher-detail-page',
  templateUrl: './publisher-detail-page.component.html',
  styleUrls: ['./publisher-detail-page.component.scss']
})
export class PublisherDetailPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Series>([]);
  paramSubscription: Subscription;
  langChangeSubscription: Subscription;
  publisherStateSubscription: Subscription;
  publisherDetailSubscription: Subscription;

  readonly displayedColumns = [
    'series',
    'volume',
    'total-issues',
    'in-library'
  ];
  readonly pageOptions = PAGE_SIZE_OPTIONS;
  pageIndex = 0;
  pageSize = PAGE_SIZE_DEFAULT;
  name: string;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private translateService: TranslateService,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to parameter updates');
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.name = params['name'];
      this.store.dispatch(loadPublisherDetail({ name: this.name }));
    });
    this.logger.trace('Subscribing to language updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to publisher state updates');
    this.publisherStateSubscription = this.store
      .select(selectPublisherState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscribing to publisher detail updates');
    this.publisherDetailSubscription = this.store
      .select(selectPublisherDetail)
      .subscribe(detail => (this.dataSource.data = detail));
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'series':
          return data.name;
        case 'volume':
          return data.volume;
        case 'total-issues':
          return data.totalIssues;
        case 'in-library':
          return data.inLibrary;
      }
      return '';
    };
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from parameter updates');
    this.paramSubscription.unsubscribe();
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
      this.translateService.instant('collections.publisher-detail.tab-title', {
        name: this.name
      })
    );
  }
}
