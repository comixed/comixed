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
import { MatTableDataSource } from '@angular/material/table';
import { selectSeriesDetail } from '@app/collections/selectors/series.selectors';
import { Issue } from '@app/collections/models/issue';
import { loadSeriesDetail } from '@app/collections/actions/series.actions';
import { TranslateService } from '@ngx-translate/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TitleService } from '@app/core/services/title.service';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import {
  selectLoadComicDetailsFilteredComics,
  selectLoadComicDetailsList
} from '@app/comic-books/selectors/load-comic-details-list.selectors';
import { loadComicDetails } from '@app/comic-books/actions/comic-details-list.actions';

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
    'name',
    'issue-number',
    'title',
    'cover-date',
    'store-date',
    'in-library'
  ];
  paramSubscription: Subscription;
  seriesDetailSubscription: Subscription;
  comicBookListSubscription: Subscription;
  totalComicsSubscription: Subscription;
  totalComics = 0;
  pageChangedSubscription: Subscription;
  userSubscription: Subscription;
  langChangeSubscription: Subscription;

  dataSource = new MatTableDataSource<Issue>([]);

  readonly pageOptions = PAGE_SIZE_OPTIONS;

  publisher = '';
  name = '';
  volume = '';
  comicBooks: ComicDetail[] = [];
  percentageComplete = 0;
  inLibrary = 0;
  totalIssues = 0;

  constructor(
    private logger: LoggerService,
    private activatedRoute: ActivatedRoute,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    public queryParameterService: QueryParameterService
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
        this.calculatePercentageComplete();
      });
    this.logger.trace('Subscribing to comic book list updates');
    this.comicBookListSubscription = this.store
      .select(selectLoadComicDetailsList)
      .subscribe(comicBooks => {
        this.comicBooks = comicBooks;
        this.calculatePercentageComplete();
      });
    this.logger.trace('Subscribing to total comics count updates');
    this.totalComicsSubscription = this.store
      .select(selectLoadComicDetailsFilteredComics)
      .subscribe(filteredCount => {
        this.totalComics = filteredCount;
        this.calculatePercentageComplete();
      });
    this.pageChangedSubscription = this.activatedRoute.queryParams.subscribe(
      () => {
        this.store.dispatch(
          loadComicDetails({
            pageIndex: null,
            pageSize: null,
            coverMonth: null,
            coverYear: null,
            archiveType: null,
            comicType: null,
            comicState: null,
            readState: false,
            unscrapedState: false,
            searchText: null,
            publisher: this.publisher,
            series: this.name,
            volume: this.volume,
            sortBy: null,
            sortDirection: null
          })
        );
      }
    );
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
    this.logger.trace('Unsubscribing from total comics updates');
    this.totalComicsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from page query updates');
    this.pageChangedSubscription.unsubscribe();
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
    return found?.comicId;
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

  private calculatePercentageComplete(): void {
    this.inLibrary = this.totalComics;
    this.totalIssues = this.dataSource.data.length;
    if (this.totalIssues > 0 && this.inLibrary > 0) {
      this.percentageComplete = (this.inLibrary / this.totalIssues) * 100;
    } else {
      this.percentageComplete = 0;
    }
    this.logger.debug(
      `Calculating percentage completed: ${this.inLibrary} / ${this.totalComics} * 100 = ${this.percentageComplete}`
    );
  }
}
