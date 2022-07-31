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
import { ComicBook } from '@app/comic-books/models/comic-book';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
  MAXIMUM_RECORDS_PREFERENCE,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_PREFERENCE,
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
import { selectComicBookList } from '@app/comic-books/selectors/comic-book-list.selectors';
import { selectLibrarySelections } from '@app/library/selectors/library-selections.selectors';

@Component({
  selector: 'cx-scraping-page',
  templateUrl: './scraping-page.component.html',
  styleUrls: ['./scraping-page.component.scss']
})
export class ScrapingPageComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  allComicsSubscription: Subscription;
  selectedComicsSubscription: Subscription;
  metadataSourceSubscription: Subscription;
  metadataSource: MetadataSource;
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
  comics: ComicBook[] = [];

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
        getUserPreference(user.preferences, MAXIMUM_RECORDS_PREFERENCE, '0'),
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
    this.allComicsSubscription = this.store
      .select(selectComicBookList)
      .subscribe(comicBooks => (this.allComics = comicBooks));
    this.selectedComicsSubscription = this.store
      .select(selectLibrarySelections)
      .subscribe(selectedIds => (this.selectedIds = selectedIds));
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
  }

  private _selectedIds: number[] = [];

  get selectedIds(): number[] {
    return this._selectedIds;
  }

  set selectedIds(ids: number[]) {
    this._selectedIds = ids;
    this.loadComics();
  }

  private _allComics: ComicBook[] = [];

  get allComics(): ComicBook[] {
    return this._allComics;
  }

  set allComics(comics: ComicBook[]) {
    this._allComics = comics;
    this.loadComics();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.allComicsSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.metadataSourceSubscription.unsubscribe();
    this.scrapingVolumeSubscription.unsubscribe();
  }

  onSelectionChanged(comicBook: ComicBook): void {
    this.logger.trace('Selected comic changed:', comicBook);
    this.currentComic = comicBook;
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

  private loadComics(): void {
    this.comics = this.allComics.filter(comic =>
      this.selectedIds.includes(comic.id)
    );
  }
}
