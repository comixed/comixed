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
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MatTableDataSource } from '@angular/material/table';
import { Publisher } from '@app/collections/models/publisher';
import { Subscription } from 'rxjs';
import { loadPublishers } from '@app/collections/actions/publisher.actions';
import {
  selectPublisherList,
  selectPublisherState
} from '@app/collections/selectors/publisher.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE,
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_SORT_BY,
  QUERY_PARAM_SORT_DIRECTION
} from '@app/library/library.constants';
import { ActivatedRoute } from '@angular/router';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { UrlParameterService } from '@app/core/services/url-parameter.service';

@Component({
  selector: 'cx-publisher-list-page',
  templateUrl: './publisher-list-page.component.html',
  styleUrls: ['./publisher-list-page.component.scss']
})
export class PublisherListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  readonly displayedColumns = ['name', 'issue-count'];
  readonly pageOptions = PAGE_SIZE_OPTIONS;

  langChangeSubscription: Subscription;
  queryParamsSubscription: Subscription;
  publisherListSubscription: Subscription;
  publisherStateSubscription: Subscription;
  userSubscription: Subscription;

  dataSource = new MatTableDataSource<Publisher>([]);
  pageIndex = 0;
  pageSize = PAGE_SIZE_DEFAULT;
  sortBy = 'name';
  sortDirection: SortDirection = 'asc';

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private urlParameterService: UrlParameterService,
    private titleService: TitleService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to query parameter updates');
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        this.sortBy = params[QUERY_PARAM_SORT_BY] || 'name';
        this.sortDirection = params[QUERY_PARAM_SORT_DIRECTION] || 'asc';
      }
    );
    this.logger.trace('Subscribing to publisher list updates');
    this.publisherListSubscription = this.store
      .select(selectPublisherList)
      .subscribe(publishers => (this.dataSource.data = publishers));
    this.logger.trace('Subscribing to publisher state updates');
    this.publisherStateSubscription = this.store
      .select(selectPublisherState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscribing to user updates');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.pageSize = parseInt(
        getUserPreference(
          user.preferences,
          PAGE_SIZE_PREFERENCE,
          `${PAGE_SIZE_DEFAULT}`
        ),
        10
      );
    });
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.logger.trace('Loading all publishers');
    this.store.dispatch(loadPublishers());
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'name':
          return data.name;
        case 'issue-count':
          return data.issueCount;
      }
      return '';
    };
    this.logger.trace('Setting up pagination');
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from query parameter updates');
    this.queryParamsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from publisher list updates');
    this.publisherListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from publisher state updates');
    this.publisherStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
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

  onSortChange(active: string, direction: 'asc' | 'desc' | ''): void {
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
      this.translateService.instant(
        'collections.publishers.list-publishers.tab-title'
      )
    );
  }
}
