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
import { Card } from '@openng/optimus-ui/card';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { TableLazyLoadEvent } from '@openng/optimus-ui/table';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE
} from '@app/library/library-constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DuplicateComicActions } from '@app/admin/actions/duplicate-comic.actions';
import { Store } from '@ngrx/store';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import { TitleService } from '@app/layout/services/title-service';
import { ComicTable } from '@app/library/components/comic-table/comic-table';
import { selectDuplicateComicEntries } from '@app/admin/selectors/duplicate-comic.selectors';

@Component({
  imports: [Card, Breadcrumb, ComicTable],
  selector: 'app-duplicate-comic-page',
  styleUrl: './duplicate-comic-page.scss',
  templateUrl: './duplicate-comic-page.html'
})
export class DuplicateComicPage {
  readonly logger = inject(LoggerService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly queryParameterService = inject(QueryParameterService);
  readonly publisher = signal('');
  readonly series = signal('');
  readonly volume = signal('');
  readonly issueNumber = signal('');
  readonly coverDate = signal(0);
  readonly duplicateComicFirst = signal(0);
  readonly duplicateComicRows = signal(10);
  readonly store = inject(Store);
  readonly duplicateComicListEntries = this.store.selectSignal(
    selectDuplicateComicEntries
  );
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly trail = signal<MenuItem[]>([]);
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.activatedRoute.params.pipe(takeUntilDestroyed()).subscribe({
      next: params => {
        this.logger.debug('Activated route params updated:', params);
        this.publisher.set(params['publisherName']);
        this.series.set(params['seriesName']);
        this.volume.set(params['volume']);
        this.issueNumber.set(params['issueNumber']);
        this.coverDate.set(+params['coverDate']);
        this.doLoadTranslations();
      }
    });
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed()).subscribe({
      next: params => {
        this.logger.debug('Activated route query params updated:', params);
        const index = +params[QUERY_PARAM_PAGE_INDEX] || 0;
        const size = +params[QUERY_PARAM_PAGE_SIZE] || 10;
        this.duplicateComicFirst.set(index * size);
        this.duplicateComicRows.set(size);
        const sortBy = '';
        const sortDirection = '';
        this.store.dispatch(
          DuplicateComicActions.load({
            publisher: this.publisher(),
            series: this.series(),
            volume: this.volume(),
            issueNumber: this.issueNumber(),
            coverDate: this.coverDate(),
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
      this.translateService.instant('duplicate-comic-page.page-title', {
        publisher: this.publisher(),
        series: this.series(),
        volume: this.volume(),
        issueNumber: this.issueNumber()
      })
    );
    this.trail.set([
      {
        label: this.translateService.instant(
          'duplicate-comic-list-page.trail-title'
        )
      },
      {
        label: this.translateService.instant(
          'duplicate-comic-page.trail-title',
          {
            publisher: this.publisher(),
            series: this.series(),
            volume: this.volume(),
            issueNumber: this.issueNumber()
          }
        )
      }
    ]);
  }
}
