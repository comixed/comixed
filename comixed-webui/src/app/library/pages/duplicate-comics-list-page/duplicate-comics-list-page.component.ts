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

import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  selectDuplicateComicList,
  selectDuplicateComicListBusy,
  selectDuplicateComicTotal
} from '@app/library/selectors/duplicate-comics.selectors';
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
import { loadDuplicateComicList } from '@app/library/actions/duplicate-comics.actions';
import {
  AsyncPipe,
  CommonModule,
  DecimalPipe,
  formatDate
} from '@angular/common';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { TitleService } from '@app/core/services/title.service';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

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
  templateUrl: './duplicate-comics-list-page.component.html',
  styleUrl: './duplicate-comics-list-page.component.scss'
})
export class DuplicateComicsListPageComponent implements OnInit {
  readonly displayedColumns = [
    'publisher',
    'series',
    'volume',
    'issue-number',
    'cover-date',
    'comic-count'
  ];

  dataSource = new MatTableDataSource<DuplicateComic>([]);
  totalEntries$ = new BehaviorSubject(0);

  logger = inject(LoggerService);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  store = inject(Store);
  queryParameterService = inject(QueryParameterService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  locale = inject(LOCALE_ID);

  constructor() {
    this.translateService.onLangChange
      .pipe(tap(() => this.doLoadTranslations()))
      .subscribe();
    this.store
      .select(selectDuplicateComicListBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectDuplicateComicList)
      .pipe(tap(comics => (this.dataSource.data = comics)))
      .subscribe();
    this.store
      .select(selectDuplicateComicTotal)
      .pipe(tap(total => this.totalEntries$.next(total)))
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(tap(params => this.doLoadComics()))
      .subscribe();
  }

  ngOnInit(): void {
    this.doLoadTranslations();
    this.doLoadComics();
  }

  onLoadDuplicateComics(entry: DuplicateComic) {
    this.logger.info('Loading duplicate comics:', entry);
    this.router.navigate([
      '/library/duplicates',
      entry.publisher,
      entry.series,
      entry.volume,
      entry.issueNumber,
      formatDate(new Date(entry.coverDate), 'yyyy-MM-dd', this.locale)
    ]);
  }

  private doLoadComics() {
    this.logger.debug('Loading duplicate comics');
    this.store.dispatch(
      loadDuplicateComicList({
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
