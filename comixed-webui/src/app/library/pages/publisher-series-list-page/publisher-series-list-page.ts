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
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { Card } from '@openng/optimus-ui/card';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import { MenuItem } from '@openng/optimus-ui/api';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectPublisherListBusy } from '@app/library/selectors/publisher-list.selectors';
import {
  selectPublisherSeriesListEntries,
  selectPublisherSeriesListTotal
} from '@app/library/selectors/publisher-series-list.selectors';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE
} from '@app/library/library-constants';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import { PublisherSeriesListActions } from '@app/library/actions/publisher-series-list.actions';

@Component({
  imports: [Breadcrumb, Card, TableModule, TranslatePipe, RouterLink],
  selector: 'app-publisher-series-list-page',
  styleUrl: './publisher-series-list-page.scss',
  templateUrl: './publisher-series-list-page.html'
})
export class PublisherSeriesListPage {
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  readonly trail = signal<MenuItem[]>([]);
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly queryParameterService = inject(QueryParameterService);
  readonly store = inject(Store);
  readonly publisherSeriesListBusy = this.store.selectSignal(
    selectPublisherListBusy
  );
  readonly publisherSeriesListEntries = this.store.selectSignal(
    selectPublisherSeriesListEntries
  );
  readonly publisherSeriesListTotal = this.store.selectSignal(
    selectPublisherSeriesListTotal
  );
  readonly publisherSeriesListFirst = signal(0);
  readonly publisherSeriesListRows = signal(10);

  publisherName = '';

  constructor() {
    this.activatedRoute.params.subscribe({
      next: params => {
        this.logger.trace('Params updated');
        this.publisherName = params['publisherName'];
      }
    });
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        const index = +params[QUERY_PARAM_PAGE_INDEX] || 0;
        const size = +params[QUERY_PARAM_PAGE_SIZE] || 10;
        this.publisherSeriesListFirst.set(index * size);
        this.publisherSeriesListRows.set(size);
        this.store.dispatch(
          PublisherSeriesListActions.load({
            name: this.publisherName,
            index,
            size,
            sortBy: '',
            sortDirection: ''
          })
        );
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
    this.doLoadTranslations();
  }

  onLoad(event: TableLazyLoadEvent): void {
    this.queryParameterService.updateQueryParam([
      { name: QUERY_PARAM_PAGE_INDEX, value: `${event.first! / event.rows!}` },
      { name: QUERY_PARAM_PAGE_SIZE, value: `${event.rows!}` }
    ]);
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('publisher-series-list-page.page-title', {
        publisherName: this.publisherName
      })
    );
    this.trail.set([
      {
        label: this.translateService.instant('publisher-list-page.page-title'),
        routerLink: ['/library/publishers']
      },
      {
        label: this.publisherName
      },
      {
        label: this.translateService.instant(
          'publisher-series-list-page.page-title',
          { publisherName: this.publisherName }
        )
      }
    ]);
  }
}
