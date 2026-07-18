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

import { AfterViewInit, Component, inject } from '@angular/core';
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
import { Series } from '@app/collections/models/series';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { User } from '@app/user/models/user';
import { selectUser } from '@app/user/selectors/user.selectors';
import {
  selectSeriesList,
  selectSeriesState,
  selectSeriesTotal
} from '@app/collections/selectors/series.selectors';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { isAdmin } from '@app/user/user.functions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { loadSeriesList } from '@app/collections/actions/series.actions';
import { FilterTextFormComponent } from '../../components/filter-text-form/filter-text-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-series-list-page',
  templateUrl: './series-list-page.component.html',
  styleUrls: ['./series-list-page.component.scss'],
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
    MatButton,
    MatTooltip,
    MatLabel,
    MatIcon,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    AsyncPipe,
    TranslateModule
  ]
})
export class SeriesListPageComponent implements AfterViewInit {
  dataSource = new MatTableDataSource<Series>([]);

  readonly pageOptions = PAGE_SIZE_OPTIONS;
  readonly displayedColumns = [
    'publisher',
    'name',
    'volume',
    'total-comics',
    'in-library'
  ];

  totalSeries$ = new BehaviorSubject(0);

  logger = inject(LoggerService);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  activatedRoute = inject(ActivatedRoute);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(
        tap(params => {
          this.logger.trace('Loading series list');
          this.store.dispatch(
            loadSeriesList({
              searchText: this.queryParameterService.filterText$.value,
              pageIndex: this.queryParameterService.pageIndex$.value,
              pageSize: this.queryParameterService.pageSize$.value,
              sortBy: this.queryParameterService.sortBy$.value,
              sortDirection: this.queryParameterService.sortDirection$.value
            })
          );
        })
      )
      .subscribe();
    this.store
      .select(selectSeriesState)
      .pipe(
        tap(state => this.store.dispatch(setBusyState({ enabled: state.busy })))
      )
      .subscribe();
    this.store
      .select(selectSeriesList)
      .pipe(
        tap(series => {
          /* istanbul ignore next */
          const pageIndex = this.dataSource.paginator?.pageIndex;
          this.dataSource.data = series;
          /* istanbul ignore if */
          if (!!pageIndex) {
            this.dataSource.paginator.pageIndex = pageIndex;
          }
        })
      )
      .subscribe();
    this.store
      .select(selectSeriesTotal)
      .pipe(tap(total => this.totalSeries$.next(total)))
      .subscribe();
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
