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
import { MatTableDataSource } from '@angular/material/table';
import { Series } from '@app/collections/models/series';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '@app/user/models/user';
import { selectUser } from '@app/user/selectors/user.selectors';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE,
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_SORT_BY,
  QUERY_PARAM_SORT_DIRECTION
} from '@app/library/library.constants';
import { MatSort, SortDirection } from '@angular/material/sort';
import { loadSeriesList } from '@app/collections/actions/series.actions';
import { getUserPreference } from '@app/user';
import { selectSeriesList } from '@app/collections/selectors/series.selectors';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { isAdmin } from '@app/user/user.functions';
import { UrlParameterService } from '@app/core/services/url-parameter.service';

@Component({
  selector: 'cx-series-list-page',
  templateUrl: './series-list-page.component.html',
  styleUrls: ['./series-list-page.component.scss']
})
export class SeriesListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Series>([]);
  seriesListSubscription: Subscription;

  readonly pageOptions = PAGE_SIZE_OPTIONS;
  pageSize = PAGE_SIZE_DEFAULT;
  pageIndex = 0;

  displayedColumns = [
    'publisher',
    'name',
    'volume',
    'total-issues',
    'in-library',
    'actions'
  ];

  queryParamsSubscription: Subscription;
  sortBy = 'name';
  sortDirection: SortDirection = 'asc';
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  user: User;
  isAdmin = false;

  selectedSeries: Series;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationSeries: ConfirmationService,
    private titleService: TitleService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private urlParameterService: UrlParameterService
  ) {
    this.logger.trace('Subscribing to query parameter updates');
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        this.sortBy = params[QUERY_PARAM_SORT_BY] || 'name';
        this.sortDirection = params[QUERY_PARAM_SORT_DIRECTION] || 'asc';
        if (!!params[QUERY_PARAM_PAGE_INDEX]) {
          this.pageIndex = +params[QUERY_PARAM_PAGE_INDEX];
        }
      }
    );
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to user updates');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.user = user;
      this.logger.trace('Loading user page size preference');
      this.pageSize = parseInt(
        getUserPreference(
          user.preferences,
          PAGE_SIZE_PREFERENCE,
          `${PAGE_SIZE_DEFAULT}`
        ),
        10
      );
      this.isAdmin = isAdmin(user);
    });
    this.seriesListSubscription = this.store
      .select(selectSeriesList)
      .subscribe(series => {
        this.dataSource.data = series;
      });
  }

  ngOnInit(): void {
    this.logger.trace('Loading series list');
    this.store.dispatch(loadSeriesList());
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from query parameter updates');
    this.queryParamsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from series list updates');
    this.seriesListSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'publisher':
          return data.publisher;
        case 'name':
          return data.name;
        case 'volume':
          return data.volume;
        case 'total-issues':
          return data.totalIssues;
        case 'in-library':
          return data.inLibrary;
      }
    };
    this.dataSource.paginator = this.paginator;
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
      this.translateService.instant('collections.series.list-page.tab-title')
    );
    this.paginator._intl.itemsPerPageLabel = this.translateService.instant(
      'collections.series.label.pagination-items-per-page'
    );
  }
}
