/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, inject, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { Card } from '@openng/optimus-ui/card';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MenuItem } from '@openng/optimus-ui/api';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { Store } from '@ngrx/store';
import {
  selectSeriesListBusy,
  selectSeriesListEntries,
  selectSeriesListTotal
} from '@app/library/selectors/series-list.selectors';
import { SeriesListActions } from '@app/library/actions/series-list.actions';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE
} from '@app/library/library-constants';

@Component({
  imports: [TranslatePipe, Card, TableModule, RouterLink, Breadcrumb],
  selector: 'app-series-list-page',
  styleUrl: './series-list-page.scss',
  templateUrl: './series-list-page.html'
})
export class SeriesListPage {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly queryParameterService = inject(QueryParameterService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly seriesListBusy = this.store.selectSignal(selectSeriesListBusy);
  readonly seriesListEntries = this.store.selectSignal(selectSeriesListEntries);
  readonly seriesListFirst = signal(0);
  readonly seriesListRows = signal(10);
  readonly seriesListTotal = this.store.selectSignal(selectSeriesListTotal);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly trail = signal<MenuItem[]>([]);

  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        const index = +params[QUERY_PARAM_PAGE_INDEX] || 0;
        const size = +params[QUERY_PARAM_PAGE_SIZE] || 10;
        this.seriesListFirst.set(index * size);
        this.seriesListRows.set(size);
        this.store.dispatch(
          SeriesListActions.load({
            searchText: '',
            index,
            size,
            sortBy: '',
            sortDirection: ''
          })
        );
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  onLoad(event: TableLazyLoadEvent): void {
    this.queryParameterService.updateQueryParam([
      { name: QUERY_PARAM_PAGE_INDEX, value: `${event.first! / event.rows!}` },
      { name: QUERY_PARAM_PAGE_SIZE, value: `${event.rows!}` }
    ]);
  }

  private doLoadSeries(args: { index: number; size: number }) {
    this.logger.trace('Loading series list');
    this.store.dispatch(
      SeriesListActions.load({
        searchText: '',
        index: args.index,
        size: args.size,
        sortBy: '',
        sortDirection: ''
      })
    );
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('series-list-page.page-title')
    );
    this.trail.set([
      {
        label: this.translateService.instant('series-list-page.page-title')
      }
    ]);
  }
}
