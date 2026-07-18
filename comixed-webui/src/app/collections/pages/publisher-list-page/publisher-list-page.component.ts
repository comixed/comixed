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
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { Publisher } from '@app/collections/models/publisher';
import { loadPublisherList } from '@app/collections/actions/publisher.actions';
import {
  selectPublisherCount,
  selectPublisherList,
  selectPublisherListBusy
} from '@app/collections/selectors/publisher.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FilterTextFormComponent } from '../../components/filter-text-form/filter-text-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { AsyncPipe } from '@angular/common';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-publisher-list-page',
  templateUrl: './publisher-list-page.component.html',
  styleUrls: ['./publisher-list-page.component.scss'],
  imports: [
    FilterTextFormComponent,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    RouterLink,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    AsyncPipe,
    TranslateModule
  ]
})
export class PublisherListPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;

  readonly displayedColumns = ['name', 'issue-count', 'series-count'];
  readonly pageOptions = PAGE_SIZE_OPTIONS;

  dataSource = new MatTableDataSource<Publisher>([]);

  totalPublishers$ = new BehaviorSubject(0);

  logger = inject(LoggerService);
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(
        tap(() => {
          this.store.dispatch(
            loadPublisherList({
              searchText: this.queryParameterService.filterText$.value,
              page: this.queryParameterService.pageIndex$.value,
              size: this.queryParameterService.pageSize$.value,
              sortBy: this.queryParameterService.sortBy$.value,
              sortDirection: this.queryParameterService.sortDirection$.value
            })
          );
        })
      )
      .subscribe();
    this.store
      .select(selectPublisherList)
      .pipe(tap(publishers => (this.dataSource.data = publishers)))
      .subscribe();
    this.store
      .select(selectPublisherCount)
      .pipe(tap(count => this.totalPublishers$.next(count)))
      .subscribe();
    this.store
      .select(selectPublisherListBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.logger.trace('Loading publishers');
    this.store.dispatch(
      loadPublisherList({
        searchText: this.queryParameterService.filterText$.value,
        page: this.queryParameterService.pageIndex$.value,
        size: this.queryParameterService.pageSize$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up sorting');
    this.dataSource.sort = this.sort;
  }

  loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publishers.list-publishers.tab-title'
      )
    );
  }
}
