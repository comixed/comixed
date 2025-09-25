/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  selectDuplicateComicList,
  selectDuplicateComicState,
  selectDuplicateComicTotal
} from '@app/library/selectors/duplicate-comic.selectors';
import { Subscription } from 'rxjs';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { DuplicateComic } from '@app/library/models/duplicate-comic';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { loadDuplicateComics } from '@app/library/actions/duplicate-comic.actions';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { TitleService } from '@app/core/services/title.service';

@Component({
  selector: 'cx-duplicate-comics-page',
  imports: [
    AsyncPipe,
    DecimalPipe,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatTable,
    TranslatePipe,
    CommonModule,
    MatHeaderCellDef
  ],
  templateUrl: './duplicate-comics-page.component.html',
  styleUrl: './duplicate-comics-page.component.scss'
})
export class DuplicateComicsPageComponent implements OnInit, OnDestroy {
  readonly displayedColumns = [
    'publisher',
    'series',
    'volume',
    'issue-number',
    'cover-date',
    'comic-count'
  ];

  logger = inject(LoggerService);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  store = inject(Store);
  queryParameterService = inject(QueryParameterService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  langChangeSubscription: Subscription;
  duplicateComicStateSubscription: Subscription;
  duplicateComicListSubscription: Subscription;
  pageChangedSubscription: Subscription;
  duplicateComicTotalSubscription: Subscription;
  totalEntries = 0;
  dataSource = new MatTableDataSource<DuplicateComic>([]);

  constructor() {
    this.logger.debug('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.doLoadTranslations()
    );
    this.logger.debug('Subscribing to duplicate comic state updates');
    this.duplicateComicStateSubscription = this.store
      .select(selectDuplicateComicState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.debug('Subscribing to duplicate comic list updates');
    this.duplicateComicListSubscription = this.store
      .select(selectDuplicateComicList)
      .subscribe(comics => (this.dataSource.data = comics));
    this.logger.debug('Subscribing to duplicate comic total updates');
    this.duplicateComicTotalSubscription = this.store
      .select(selectDuplicateComicTotal)
      .subscribe(total => (this.totalEntries = total));
    this.logger.debug('Subscribing to page changes');
    this.pageChangedSubscription = this.activatedRoute.queryParams.subscribe(
      params => this.doLoadComics()
    );
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from duplicate comic state updates');
    this.duplicateComicStateSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from duplicate comic list updates');
    this.duplicateComicListSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from duplicate comic total updates');
    this.duplicateComicTotalSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.doLoadTranslations();
    this.doLoadComics();
  }

  private doLoadComics() {
    this.logger.debug('Loading duplicate comics');
    this.store.dispatch(
      loadDuplicateComics({
        pageSize: this.queryParameterService.pageSize$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('duplicate-comic-list.tab-title')
    );
  }
}
