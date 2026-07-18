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
import { LoggerService } from '@angular-ru/cdk/logger';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
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
import { selectSeriesDetail } from '@app/collections/selectors/series.selectors';
import { Issue } from '@app/collections/models/issue';
import { loadSeriesDetail } from '@app/collections/actions/series.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TitleService } from '@app/core/services/title.service';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { loadComicsByFilter } from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicFilteredCount,
  selectComicList
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { SeriesDetailNamePipe } from '../../pipes/series-detail-name.pipe';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-series-metadata-page',
  templateUrl: './series-metadata-page.component.html',
  styleUrls: ['./series-metadata-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    RouterLink,
    MatIcon,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatSortHeader,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    AsyncPipe,
    DecimalPipe,
    DatePipe,
    TranslateModule,
    SeriesDetailNamePipe
  ]
})
export class SeriesMetadataPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  readonly displayedColumns = [
    'name',
    'issue-number',
    'title',
    'cover-date',
    'store-date',
    'in-library'
  ];
  readonly pageOptions = PAGE_SIZE_OPTIONS;

  dataSource = new MatTableDataSource<Issue>([]);
  totalComics$ = new BehaviorSubject(0);
  publisher$ = new BehaviorSubject('');
  name$ = new BehaviorSubject('');
  volume$ = new BehaviorSubject('');
  comics$ = new BehaviorSubject<DisplayableComic[]>([]);
  percentageComplete$ = new BehaviorSubject(0);
  inLibrary$ = new BehaviorSubject(0);
  totalIssues$ = new BehaviorSubject(0);

  logger = inject(LoggerService);
  activatedRoute = inject(ActivatedRoute);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.publisher$.next(params['publisher']);
          this.name$.next(params['name']);
          this.volume$.next(params['volume']);
          this.logger.debug(
            `Loading series detail: publisher=${this.publisher$.value} name=${this.name$.value} volume=${this.volume$.value}`
          );
          this.store.dispatch(
            loadSeriesDetail({
              publisher: this.publisher$.value,
              name: this.name$.value,
              volume: this.volume$.value
            })
          );
        })
      )
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.store
      .select(selectSeriesDetail)
      .pipe(
        tap(issues => {
          this.dataSource.data = issues;
          this.calculatePercentageComplete();
        })
      )
      .subscribe();
    this.store
      .select(selectComicList)
      .pipe(
        tap(comics => {
          this.comics$.next(comics);
          this.calculatePercentageComplete();
        })
      )
      .subscribe();
    this.store
      .select(selectComicFilteredCount)
      .pipe(
        tap(filteredCount => {
          this.totalComics$.next(filteredCount);
          this.calculatePercentageComplete();
        })
      )
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(
        tap(() => {
          this.store.dispatch(
            loadComicsByFilter({
              pageIndex: this.queryParameterService.pageIndex$.value,
              pageSize: this.queryParameterService.pageSize$.value,
              coverMonth: null,
              coverYear: null,
              archiveType: null,
              comicType: null,
              comicState: null,
              selected: false,
              missing: false,
              unscrapedState: false,
              searchText: null,
              publisher: this.publisher$.value,
              series: this.name$.value,
              volume: this.volume$.value,
              sortBy: null,
              sortDirection: null,
              pageCount: null
            })
          );
        })
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up data source sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'issue-number':
          return data.issueNumber;
        case 'cover-date':
          return data.coverDate;
        case 'store-date':
          return data.storeDate;
        case 'in-library':
          return `${data.found}`;
      }
      return '';
    };
    this.logger.trace('Setting up data source pagination');
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  getComicBookIdForRow(issue: Issue): number {
    const found = this.comics$.value.find(
      comicBook =>
        comicBook.publisher === issue.publisher &&
        comicBook.series === issue.series &&
        comicBook.volume === issue.volume &&
        comicBook.issueNumber === issue.issueNumber
    );
    return found?.comicBookId;
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collections.series-detail.tab-title', {
        publisher: this.publisher$.value,
        name: this.name$.value,
        volume: this.volume$.value
      })
    );
  }

  private calculatePercentageComplete(): void {
    this.inLibrary$.next(this.totalComics$.value);
    this.totalIssues$.next(this.dataSource.data.length);
    this.logger.debug(
      `Calculating percentage completed: ${this.inLibrary$.value} / ${this.totalComics$.value} * 100 = ${this.percentageComplete$}`
    );
    if (this.totalIssues$.value > 0 && this.inLibrary$.value > 0) {
      this.percentageComplete$.next(
        (this.inLibrary$.value / this.totalIssues$.value) * 100
      );
    } else {
      this.percentageComplete$.next(0);
    }
  }
}
