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
import { loadPublisherList } from '@app/collections/actions/publisher.actions';
import {
  selectPublisherCount,
  selectPublisherList,
  selectPublisherState
} from '@app/collections/selectors/publisher.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MatSort, SortDirection } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  QUERY_PARAM_FILTER_TEXT
} from '@app/core';
import { PREFERENCE_PAGE_SIZE } from '@app/comic-files/comic-file.constants';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'cx-publisher-list-page',
  templateUrl: './publisher-list-page.component.html',
  styleUrls: ['./publisher-list-page.component.scss']
})
export class PublisherListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;

  readonly displayedColumns = ['name', 'issue-count', 'series-count'];
  readonly pageOptions = PAGE_SIZE_OPTIONS;

  queryParamsSubscription: Subscription;
  langChangeSubscription: Subscription;
  publisherListSubscription: Subscription;
  publisherCountSubscription: Subscription;
  publisherStateSubscription: Subscription;
  userSubscription: Subscription;
  totalPublishers = 0;
  filterTextForm: FormGroup;

  dataSource = new MatTableDataSource<Publisher>([]);
  pageIndex = 0;
  pageSize = PAGE_SIZE_DEFAULT;
  sortBy = 'name';
  sortDirection: SortDirection = 'asc';

  constructor(
    private logger: LoggerService,
    private activatedRoute: ActivatedRoute,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to query parameter updates');
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      () => {
        this.store.dispatch(
          loadPublisherList({
            searchText: this.queryParameterService.filterText$.value,
            page: this.queryParameterService.pageIndex$.value,
            size: this.queryParameterService.pageSize$.value,
            sortBy: this.queryParameterService.sortBy$.value,
            sortDirection: this.queryParameterService.sortDirection$.value
          })
        );
      }
    );
    this.filterTextForm = this.formBuilder.group({
      filterTextInput: ['']
    });
    this.logger.trace('Subscribing to publisher list updates');
    this.publisherListSubscription = this.store
      .select(selectPublisherList)
      .subscribe(publishers => (this.dataSource.data = publishers));
    this.logger.trace('Subscribing to publisher count updates');
    this.publisherCountSubscription = this.store
      .select(selectPublisherCount)
      .subscribe(count => (this.totalPublishers = count));
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
          PREFERENCE_PAGE_SIZE,
          `${PAGE_SIZE_DEFAULT}`
        ),
        10
      );
    });
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.logger.trace('Loading publishers');
    this.store.dispatch(
      loadPublisherList({
        searchText: this.queryParameterService.filterText$.value,
        page: this.queryParameterService.pageIndex$.value,
        size: this.queryParameterService.pageSize$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up sorting');
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing to query parameter updates');
    this.queryParamsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from publisher list updates');
    this.publisherListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from publisher count updates');
    this.publisherCountSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from publisher state updates');
    this.publisherStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
  }

  loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publishers.list-publishers.tab-title'
      )
    );
  }

  onApplyFilter(searchText: string): void {
    this.logger.debug('Setting collection search text:', searchText);
    this.queryParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_FILTER_TEXT,
        value: searchText?.length > 0 ? searchText : null
      }
    ]);
  }
}
