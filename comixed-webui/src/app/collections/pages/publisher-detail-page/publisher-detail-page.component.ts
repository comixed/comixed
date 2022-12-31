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
import { MatSort, SortDirection } from '@angular/material/sort';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE,
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_SORT_BY,
  QUERY_PARAM_SORT_DIRECTION
} from '@app/library/library.constants';
import { MatTableDataSource } from '@angular/material/table';
import { Series } from '@app/collections/models/series';
import {
  selectPublisherDetail,
  selectPublisherState
} from '@app/collections/selectors/publisher.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { loadPublisherDetail } from '@app/collections/actions/publisher.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { UrlParameterService } from '@app/core/services/url-parameter.service';

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
  queryParamSubscription: Subscription;
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
  sortBy: string;
  sortDirection: SortDirection;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private urlParameterService: UrlParameterService,
    private titleService: TitleService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Subscribing to parameter updates');
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.name = params['name'];
      this.store.dispatch(loadPublisherDetail({ name: this.name }));
    });
    this.logger.trace('Subscribing to query parameter updates');
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        this.sortBy = params[QUERY_PARAM_SORT_BY] || 'name';
        this.sortDirection = params[QUERY_PARAM_SORT_DIRECTION] || 'asc';
      }
    );
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

  onPageChange(
    pageSize: number,
    pageIndex: number,
    previousPageIndex: number
  ): void {
    if (this.pageSize != pageSize) {
      this.logger.trace('Page size changed');
      this.store.dispatch(
        saveUserPreference({
          name: PAGE_SIZE_PREFERENCE,
          value: `${pageSize}`
        })
      );
    }
    if (pageIndex !== previousPageIndex) {
      this.logger.debug('Page index changed:', pageIndex);
      this.urlParameterService.updateQueryParam([
        {
          name: QUERY_PARAM_PAGE_INDEX,
          value: `${pageIndex}`
        }
      ]);
    }
  }

  onSortChange(active: string, direction: SortDirection): void {
    this.urlParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_SORT_BY,
        value: active
      },
      {
        name: QUERY_PARAM_SORT_DIRECTION,
        value: direction
      }
    ]);
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collections.publisher-detail.tab-title', {
        name: this.name
      })
    );
  }
}
