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
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { MatTableDataSource } from '@angular/material/table';
import { selectSeriesDetail } from '@app/collections/selectors/series.selectors';
import { Issue } from '@app/collections/models/issue';
import { loadSeriesDetail } from '@app/collections/actions/series.actions';
import { selectComicBookList } from '@app/comic-books/selectors/comic-book-list.selectors';
import { TranslateService } from '@ngx-translate/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TitleService } from '@app/core/services/title.service';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';

@Component({
  selector: 'cx-series-detail-page',
  templateUrl: './series-detail-page.component.html',
  styleUrls: ['./series-detail-page.component.scss']
})
export class SeriesDetailPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  readonly displayedColumns = [
    'publisher',
    'name',
    'volume',
    'issue-number',
    'cover-date',
    'store-date',
    'in-library'
  ];
  paramSubscription: Subscription;
  seriesDetailSubscription: Subscription;
  comicBookListSubscription: Subscription;
  userSubscription: Subscription;
  langChangeSubscription: Subscription;

  dataSource = new MatTableDataSource<Issue>([]);

  readonly pageOptions = PAGE_SIZE_OPTIONS;

  publisher = '';
  name = '';
  volume = '';
  comicBooks: ComicBook[] = [];

  constructor(
    private logger: LoggerService,
    private activatedRoute: ActivatedRoute,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    public urlParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to parameter updates');
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.publisher = params['publisher'];
      this.name = params['name'];
      this.volume = params['volume'];
      this.logger.debug(
        `Loading series detail: publisher=${this.publisher} name=${this.name} volume=${this.volume}`
      );
      this.store.dispatch(
        loadSeriesDetail({
          publisher: this.publisher,
          name: this.name,
          volume: this.volume
        })
      );
    });
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to series detail updates');
    this.seriesDetailSubscription = this.store
      .select(selectSeriesDetail)
      .subscribe(issues => {
        this.dataSource.data = issues;
      });
    this.logger.trace('Subscribing to comic book list updates');
    this.comicBookListSubscription = this.store
      .select(selectComicBookList)
      .subscribe(comicBooks => (this.comicBooks = comicBooks));
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

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from parameter updates');
    this.paramSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from series detail updates');
    this.seriesDetailSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic book list updates');
    this.comicBookListSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  getComicBookIdForRow(issue: Issue): number {
    const found = this.comicBooks.find(
      comicBook =>
        comicBook.publisher === issue.publisher &&
        comicBook.series === issue.series &&
        comicBook.volume === issue.volume &&
        comicBook.issueNumber === issue.issueNumber
    );
    return found?.id;
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collections.series-detail.tab-title', {
        publisher: this.publisher,
        name: this.name,
        volume: this.volume
      })
    );
  }
}
