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
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE
} from '@app/core';

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
    private titleService: TitleService,
    private translateService: TranslateService,
    public urlParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
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
    this.logger.trace('Unsubscribing from publisher list updates');
    this.publisherListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from publisher state updates');
    this.publisherStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publishers.list-publishers.tab-title'
      )
    );
  }
}
