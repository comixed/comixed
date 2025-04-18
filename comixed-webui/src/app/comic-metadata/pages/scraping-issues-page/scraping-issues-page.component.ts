/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
  MATCH_PUBLISHER_PREFERENCE,
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { MetadataEvent } from '@app/comic-metadata/models/event/metadata-event';
import { loadVolumeMetadata } from '@app/comic-metadata/actions/single-book-scraping.actions';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import {
  selectChosenMetadataSource,
  selectScrapingVolumeMetadata,
  selectSingleBookScrapingState
} from '@app/comic-metadata/selectors/single-book-scraping.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { TitleService } from '@app/core/services/title.service';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { loadComicBook } from '@app/comic-books/actions/comic-book.actions';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { selectComicBook } from '@app/comic-books/selectors/comic-book.selectors';
import {
  selectMultiBookScrapingCurrent,
  selectMultiBookScrapingList,
  selectMultiBookScrapingState
} from '@app/comic-metadata/selectors/multi-book-scraping.selectors';
import { MultiBookScrapingProcessStatus } from '@app/comic-metadata/models/multi-book-scraping-process-status';
import {
  loadMultiBookScrapingPage,
  multiBookScrapingRemoveBook,
  multiBookScrapingSetCurrentBook,
  startMultiBookScraping
} from '@app/comic-metadata/actions/multi-book-scraping.actions';
import { MultiBookScrapingState } from '@app/comic-metadata/reducers/multi-book-scraping.reducer';
import { selectMetadataSourceListState } from '@app/comic-metadata/selectors/metadata-source-list.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cx-scraping-issues-page',
  templateUrl: './scraping-issues-page.component.html',
  styleUrls: ['./scraping-issues-page.component.scss']
})
export class ScrapingIssuesPageComponent implements OnInit, OnDestroy {
  readonly displayColumns = [
    'actions',
    'thumbnail',
    'publisher',
    'series',
    'volume',
    'issue-number'
  ];

  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  multiBookScrapingStateSubscription: Subscription;
  multiBookScrapingState: MultiBookScrapingState;
  multiBookListSubscription: Subscription;
  comicBooks: ComicBook[] = [];
  dataSource = new MatTableDataSource<ComicDetail>();
  multiBookCurrentComicDetailSubscription: Subscription;
  currentComicBook: ComicBook = null;
  metadataSourceSubscription: Subscription;
  metadataSource: MetadataSource;
  comicBookSubscription: Subscription;
  pageChangedSubscription: Subscription;
  currentSeries = '';
  currentVolume = '';
  currentIssueNumber = '';
  skipCache = false;
  matchPublisher = false;
  maximumRecords = 0;
  scrapingStateSubscription: Subscription;
  scrapingVolumeSubscription: Subscription;
  scrapingVolumes: VolumeMetadata[] = [];
  selectedIds: number[] = [];
  showPopup = false;
  popupComicDetail: ComicDetail = null;
  protected readonly selectMetadataSourceListState =
    selectMetadataSourceListState;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    public queryParameterService: QueryParameterService
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.skipCache =
        getUserPreference(
          user.preferences,
          SKIP_CACHE_PREFERENCE,
          `${false}`
        ) === `${true}`;
      this.matchPublisher =
        getUserPreference(
          user.preferences,
          MATCH_PUBLISHER_PREFERENCE,
          `${false}`
        ) === `${true}`;
      this.maximumRecords = parseInt(
        getUserPreference(
          user.preferences,
          MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
          '0'
        ),
        10
      );
    });
    this.multiBookScrapingStateSubscription = this.store
      .select(selectMultiBookScrapingState)
      .subscribe(state => {
        this.multiBookScrapingState = state;
        if (
          this.multiBookScrapingState.status ===
            MultiBookScrapingProcessStatus.SETUP &&
          !this.multiBookScrapingState.busy
        ) {
          this.logger.debug('Starting multi-book comic scraping');
          this.store.dispatch(
            startMultiBookScraping({
              pageSize: this.queryParameterService.pageSize$.value
            })
          );
        }
        this.store.dispatch(
          setBusyState({ enabled: this.multiBookScrapingState.busy })
        );
      });
    this.multiBookListSubscription = this.store
      .select(selectMultiBookScrapingList)
      .subscribe(comicBooks => {
        this.comicBooks = comicBooks;
        this.dataSource.data = this.comicBooks.map(entry => entry.detail);
      });
    this.multiBookCurrentComicDetailSubscription = this.store
      .select(selectMultiBookScrapingCurrent)
      .subscribe(currentComicBook => {
        this.currentComicBook = currentComicBook;
        this.scrapingVolumes = [];
        this.currentVolume = null;
      });
    this.metadataSourceSubscription = this.store
      .select(selectChosenMetadataSource)
      .subscribe(metadataSource => {
        this.metadataSource = metadataSource;
      });
    this.scrapingStateSubscription = this.store
      .select(selectSingleBookScrapingState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loadingRecords }));
      });
    this.scrapingVolumeSubscription = this.store
      .select(selectScrapingVolumeMetadata)
      .subscribe(volumes => (this.scrapingVolumes = volumes));
    this.comicBookSubscription = this.store
      .select(selectComicBook)
      .subscribe(comicBook => (this.currentComicBook = comicBook));
    this.pageChangedSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        this.store.dispatch(
          loadMultiBookScrapingPage({
            pageSize: this.queryParameterService.pageSize$.value,
            pageNumber: this.queryParameterService.pageIndex$.value
          })
        );
      }
    );
  }

  get started(): boolean {
    return (
      this.multiBookScrapingState?.status ===
      MultiBookScrapingProcessStatus.STARTED
    );
  }

  ngOnInit(): void {
    this.store.dispatch(
      startMultiBookScraping({
        pageSize: this.queryParameterService.pageSize$.value
      })
    );
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.multiBookScrapingStateSubscription.unsubscribe();
    this.multiBookListSubscription.unsubscribe();
    this.multiBookCurrentComicDetailSubscription.unsubscribe();
    this.metadataSourceSubscription.unsubscribe();
    this.scrapingVolumeSubscription.unsubscribe();
    this.comicBookSubscription.unsubscribe();
    this.pageChangedSubscription.unsubscribe();
  }

  onSelectionChanged(comicBook: ComicDetail): void {
    this.logger.trace('Selected comic changed:', comicBook);
    this.currentComicBook = null;
    this.store.dispatch(loadComicBook({ id: comicBook.comicId }));
  }

  onScrape(event: MetadataEvent): void {
    this.logger.trace('Storing comic details');
    this.currentSeries = event.series;
    this.currentVolume = event.volume;
    this.currentIssueNumber = event.issueNumber;
    this.logger.trace('Fetching scraping volumes:', event);
    this.store.dispatch(
      loadVolumeMetadata({
        metadataSource: event.metadataSource,
        publisher: event.publisher,
        series: event.series,
        maximumRecords: event.maximumRecords,
        skipCache: event.skipCache,
        matchPublisher: event.matchPublisher
      })
    );
  }

  onShowPopup(showPopup: boolean, comicDetail: ComicDetail): void {
    this.showPopup = showPopup;
    this.popupComicDetail = comicDetail;
  }

  onRemoveComicBook(comicDetail: ComicDetail) {
    this.store.dispatch(
      multiBookScrapingRemoveBook({
        comicBook: this.comicBooks.find(
          entry => entry.comicBookId === comicDetail.comicId
        ),
        pageSize: this.queryParameterService.pageSize$.value
      })
    );
  }

  onSelectComicBook(comicDetail: ComicDetail): void {
    const comicBook = this.comicBooks.find(
      entry => entry.comicBookId === comicDetail.comicId
    );
    this.logger.debug('Selecting comic book:', comicDetail);
    this.store.dispatch(multiBookScrapingSetCurrentBook({ comicBook }));
  }

  private loadTranslations(): void {
    this.logger.trace('Loading translations');
    this.titleService.setTitle(
      this.translateService.instant('scraping-issues-page.tab-title')
    );
  }
}
