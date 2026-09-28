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
import { Store } from '@ngrx/store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DuplicateComicListActions } from '@app/admin/actions/duplicate-comic-list.actions';
import { Card } from '@openng/optimus-ui/card';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import {
  selectDuplicateComicListBusy,
  selectDuplicateComicListEntries,
  selectDuplicateComicListTotal
} from '@app/admin/selectors/duplicate-comic-list.selectors';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE
} from '@app/library/library-constants';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import { MenuItem } from '@openng/optimus-ui/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  imports: [
    Card,
    Breadcrumb,
    TableModule,
    TranslatePipe,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  selector: 'app-duplicte-comic-list-page',
  styleUrl: './duplicate-comic-list-page.scss',
  templateUrl: './duplicate-comic-list-page.html'
})
export class DuplicateComicListPage {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly queryParameterService = inject(QueryParameterService);
  readonly store = inject(Store);
  readonly duplicateComicListEntries = this.store.selectSignal(
    selectDuplicateComicListEntries
  );
  readonly duplicateComicListTotal = this.store.selectSignal(
    selectDuplicateComicListTotal
  );
  readonly duplicateComicListBusy = this.store.selectSignal(
    selectDuplicateComicListBusy
  );
  readonly duplicateComicListFirst = signal(0);
  readonly duplicateComicListRows = signal(10);

  readonly trail = signal<MenuItem[]>([]);
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed()).subscribe({
      next: params => {
        const index = +params[QUERY_PARAM_PAGE_INDEX] || 0;
        const size = +params[QUERY_PARAM_PAGE_SIZE] || 10;
        this.duplicateComicListFirst.set(index * size);
        this.duplicateComicListRows.set(size);
        const sortBy = '';
        const sortDirection = '';
        this.store.dispatch(
          DuplicateComicListActions.load({
            index,
            size,
            sortBy,
            sortDirection
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
      this.translateService.instant('duplicate-comic-list-page.page-title')
    );
    this.trail.set([
      {
        label: this.translateService.instant(
          'duplicate-comic-list-page.trail-title'
        )
      }
    ]);
  }
}
