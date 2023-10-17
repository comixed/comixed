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
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { MetadataEvent } from '@app/comic-metadata/models/event/metadata-event';
import { loadVolumeMetadata } from '@app/comic-metadata/actions/metadata.actions';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import {
  selectChosenMetadataSource,
  selectMetadataState,
  selectVolumeMetadata
} from '@app/comic-metadata/selectors/metadata.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { TitleService } from '@app/core/services/title.service';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_PREFERENCE } from '@app/core';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { loadComicBook } from '@app/comic-books/actions/comic-book.actions';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { selectComicBook } from '@app/comic-books/selectors/comic-book.selectors';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { selectLoadComicDetailsList } from '@app/comic-books/selectors/load-comic-details-list.selectors';
import { loadComicDetailsById } from '@app/comic-books/actions/comics-details-list.actions';

@Component({
  selector: 'cx-scraping-page',
  templateUrl: './scraping-page.component.html',
  styleUrls: ['./scraping-page.component.scss']
})
export class ScrapingPageComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  comicDetailListSubscription: Subscription;
  selectedComicsSubscription: Subscription;
  metadataSourceSubscription: Subscription;
  metadataSource: MetadataSource;
  comicBookSubscription: Subscription;
  currentComic: ComicBook = null;
  currentSeries = '';
  currentVolume = '';
  currentIssueNumber = '';
  skipCache = false;
  maximumRecords = 0;
  scrapingStateSubscription: Subscription;
  scrapingVolumeSubscription: Subscription;
  scrapingVolumes: VolumeMetadata[] = [];
  pageSize = PAGE_SIZE_DEFAULT;
  comicDetails: ComicDetail[] = [];
  selectedIds: number[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService
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
      this.maximumRecords = parseInt(
        getUserPreference(
          user.preferences,
          MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
          '0'
        ),
        10
      );
      this.pageSize = parseInt(
        getUserPreference(
          user.preferences,
          PAGE_SIZE_PREFERENCE,
          `${this.pageSize}`
        ),
        10
      );
    });
    this.comicDetailListSubscription = this.store
      .select(selectLoadComicDetailsList)
      .subscribe(comicDetails => {
        this.comicDetails = comicDetails;
        console.log('*** comicDetails:', comicDetails);
        if (this.comicDetails.length > 0) {
          this.store.dispatch(
            loadComicBook({ id: this.comicDetails[0].comicId })
          );
        }
      });
    this.selectedComicsSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(selectedIds => {
        this.selectedIds = selectedIds;
        this.logger.trace('Loading comic details for selections');
        this.store.dispatch(
          loadComicDetailsById({ comicBookIds: this.selectedIds })
        );
      });
    this.metadataSourceSubscription = this.store
      .select(selectChosenMetadataSource)
      .subscribe(metadataSource => (this.metadataSource = metadataSource));
    this.scrapingStateSubscription = this.store
      .select(selectMetadataState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loadingRecords }));
      });
    this.scrapingVolumeSubscription = this.store
      .select(selectVolumeMetadata)
      .subscribe(volumes => (this.scrapingVolumes = volumes));
    this.comicBookSubscription = this.store
      .select(selectComicBook)
      .subscribe(comicBook => (this.currentComic = comicBook));
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.comicDetailListSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.metadataSourceSubscription.unsubscribe();
    this.scrapingVolumeSubscription.unsubscribe();
    this.comicBookSubscription.unsubscribe();
  }

  onSelectionChanged(comicBook: ComicDetail): void {
    this.logger.trace('Selected comic changed:', comicBook);
    this.currentComic = null;
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
        metadataSource: this.metadataSource,
        series: event.series,
        maximumRecords: event.maximumRecords,
        skipCache: event.skipCache
      })
    );
  }

  private loadTranslations(): void {
    this.logger.trace('Loading translations');
    this.titleService.setTitle(
      this.translateService.instant('scraping.page-title')
    );
  }
}
