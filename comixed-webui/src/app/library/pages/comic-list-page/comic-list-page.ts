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
import { ActivatedRoute } from '@angular/router';
import { Card } from '@openng/optimus-ui/card';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { TitleService } from '@app/layout/services/title-service';
import { Store } from '@ngrx/store';
import {
  selectComicList,
  selectComicListBusy,
  selectComicListCoverMonthList,
  selectComicListCoverYearList,
  selectComicListFilterCount,
  selectComicListTotalCount
} from '@app/library/selectors/comic-list.selectors';
import { AlertService } from '@app/services/alert-service';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import { ComicListActions } from '@app/library/actions/comic-list.actions';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE
} from '@app/library/library-constants';
import { ComicTable } from '@app/library/components/comic-table/comic-table';

@Component({
  imports: [Card, TableModule, Breadcrumb, ComicTable],
  selector: 'app-comic-list-page',
  styleUrl: './comic-list-page.scss',
  templateUrl: './comic-list-page.html'
})
export class ComicListPage {
  readonly logger = inject(LoggerService);
  readonly queryParameterService = inject(QueryParameterService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly store = inject(Store);
  readonly comicListBusy = this.store.selectSignal(selectComicListBusy);
  readonly comicListEntries = this.store.selectSignal(selectComicList);
  readonly comicListFirst = signal(0);
  readonly comicListRows = signal(10);
  readonly comicListTotalCount = this.store.selectSignal(
    selectComicListTotalCount
  );
  readonly comicListFilterCount = this.store.selectSignal(
    selectComicListFilterCount
  );
  readonly coverMonthList = this.store.selectSignal(
    selectComicListCoverMonthList
  );
  readonly coverYearList = this.store.selectSignal(
    selectComicListCoverYearList
  );
  readonly trail = signal<MenuItem[]>([]);

  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  allComics = true;
  readComics = false;
  unscrapedComics = false;
  duplicateComics = false;
  deletedComics = false;

  constructor() {
    this.activatedRoute.data.subscribe({
      next: data => {
        this.logger.debug('Activated route data updated:', data);
        this.readComics = data['readOnly'] === true;
        this.unscrapedComics = data['unscraped'] === true;
        this.duplicateComics = data['duplicates'] === true;
        this.deletedComics = data['deleted'] === true;
        this.allComics =
          !this.readComics &&
          !this.unscrapedComics &&
          !this.duplicateComics &&
          !this.deletedComics;
      }
    });
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        const page = +params[QUERY_PARAM_PAGE_INDEX] || 0;
        const size = +params[QUERY_PARAM_PAGE_SIZE] || 10;
        this.comicListFirst.set(page * size);
        this.comicListRows.set(size);
        this.store.dispatch(
          ComicListActions.loadByFilters({
            pageIndex: page,
            pageSize: size,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: null,
            selected: false,
            missing: false,
            unscrapedState: this.unscrapedComics,
            searchText: null,
            publisher: null,
            series: null,
            volume: null,
            pageCount: null,
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

  getPageType(): string {
    if (this.readComics) {
      return 'READ';
    }
    if (this.unscrapedComics) {
      return 'UNSCRAPED';
    }
    if (this.duplicateComics) {
      return 'DUPLICATE';
    }
    if (this.deletedComics) {
      return 'DELETED';
    }
    return '';
  }

  onLoad(event: TableLazyLoadEvent): void {
    this.queryParameterService.updateQueryParam([
      { name: QUERY_PARAM_PAGE_INDEX, value: `${event.first! / event.rows!}` },
      { name: QUERY_PARAM_PAGE_SIZE, value: `${event.rows!}` }
    ]);
  }

  private doLoadTranslations() {
    const pageTitle = this.translateService.instant(
      'comic-list-page.page-title',
      { pageType: this.getPageType() }
    );
    this.titleService.setTitle(pageTitle);
    this.trail.set([{ label: pageTitle }]);
  }
}
