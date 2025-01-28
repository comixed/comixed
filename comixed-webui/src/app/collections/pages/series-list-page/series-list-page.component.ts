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

import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Series } from '@app/collections/models/series';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { User } from '@app/user/models/user';
import { selectUser } from '@app/user/selectors/user.selectors';
import {
  selectSeriesList,
  selectSeriesState,
  selectSeriesTotal
} from '@app/collections/selectors/series.selectors';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { isAdmin } from '@app/user/user.functions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { loadSeriesList } from '@app/collections/actions/series.actions';

@Component({
  selector: 'cx-series-list-page',
  templateUrl: './series-list-page.component.html',
  styleUrls: ['./series-list-page.component.scss']
})
export class SeriesListPageComponent implements OnDestroy, AfterViewInit {
  dataSource = new MatTableDataSource<Series>([]);
  seriesListSubscription: Subscription;
  seriesStateSubscription: Subscription;

  readonly pageOptions = PAGE_SIZE_OPTIONS;

  displayedColumns = [
    'publisher',
    'name',
    'volume',
    'total-comics',
    'in-library'
  ];

  langChangeSubscription: Subscription;
  queryParamsSubscription: Subscription;
  userSubscription: Subscription;
  user: User;
  isAdmin = false;
  totalSeriesSubscription: Subscription;
  totalSeries = 0;

  selectedSeries: Series;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to query parameter updates');
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        this.logger.trace('Loading series list');
        this.store.dispatch(
          loadSeriesList({
            pageIndex: this.queryParameterService.pageIndex$.value,
            pageSize: this.queryParameterService.pageSize$.value,
            sortBy: this.queryParameterService.sortBy$.value,
            sortDirection: this.queryParameterService.sortDirection$.value
          })
        );
      }
    );
    this.logger.trace('Subscribing to user updates');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.user = user;
      this.logger.trace('Loading user page size preference');
      this.isAdmin = isAdmin(user);
    });
    this.logger.trace('Subscribing to series state updates');
    this.seriesStateSubscription = this.store
      .select(selectSeriesState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscribing to series list updates');
    this.seriesListSubscription = this.store
      .select(selectSeriesList)
      .subscribe(series => {
        /* istanbul ignore next */
        const pageIndex = this.dataSource.paginator?.pageIndex;
        this.dataSource.data = series;
        /* istanbul ignore if */
        if (!!pageIndex) {
          this.dataSource.paginator.pageIndex = pageIndex;
        }
      });
    this.logger.trace('Subscribing to total series updates');
    this.totalSeriesSubscription = this.store
      .select(selectSeriesTotal)
      .subscribe(total => (this.totalSeries = total));
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from query parameter updates');
    this.queryParamsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from series state updates');
    this.seriesStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from series list updates');
    this.seriesListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from series total updates');
    this.totalSeriesSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collections.series.list-page.tab-title')
    );
  }
}
