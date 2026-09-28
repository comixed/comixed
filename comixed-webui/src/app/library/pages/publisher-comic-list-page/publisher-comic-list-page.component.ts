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
import { TranslateService } from '@ngx-translate/core';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE
} from '@app/library/library-constants';
import { MenuItem } from '@openng/optimus-ui/api';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TitleService } from '@app/layout/services/title-service';
import { ActivatedRoute } from '@angular/router';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import { Store } from '@ngrx/store';
import {
  selectPublisherComicListBusy,
  selectPublisherComicListEntries,
  selectPublisherComicListFilteredTotal
} from '@app/library/selectors/publisher-comic-list.selectors';
import { PublisherComicListActions } from '@app/library/actions/publisher-comic-list.actions';
import { ComicTable } from '@app/library/components/comic-table/comic-table';

@Component({
  imports: [Breadcrumb, Card, TableModule, ComicTable],
  selector: 'app-publisher-issue-list-page',
  styleUrl: './publisher-comic-list-page.component.scss',
  templateUrl: './publisher-comic-list-page.component.html'
})
export class PublisherComicListPage {
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  readonly trail = signal<MenuItem[]>([]);
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly queryParameterService = inject(QueryParameterService);
  readonly store = inject(Store);
  readonly publisherComicListBusy = this.store.selectSignal(
    selectPublisherComicListBusy
  );
  readonly publisherComicListEntries = this.store.selectSignal(
    selectPublisherComicListEntries
  );
  readonly publisherComicListTotal = this.store.selectSignal(
    selectPublisherComicListFilteredTotal
  );
  readonly publisherComicListFirst = signal(0);
  readonly publisherComicListRows = signal(10);

  publisherName = '';
  protected readonly selectPublisherComicListFilteredTotal =
    selectPublisherComicListFilteredTotal;

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
        this.publisherComicListFirst.set(index * size);
        this.publisherComicListRows.set(size);
        this.store.dispatch(
          PublisherComicListActions.load({
            publisherName: this.publisherName,
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
      this.translateService.instant('publisher-comic-list-page.page-title', {
        publisherName: this.publisherName
      })
    );
    this.trail.set([
      {
        label: this.translateService.instant('publisher-list-page.trail-title'),
        routerLink: ['/library/publishers']
      },
      {
        label: this.publisherName
      },
      {
        label: this.translateService.instant(
          'publisher-comic-list-page.trail-title'
        )
      }
    ]);
  }
}
