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

import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  MatCard,
  MatCardContent,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatLabel } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { ComicScrapingComponent } from '../../../comic-books/components/comic-scraping/comic-scraping.component';
import { MatPaginator } from '@angular/material/paginator';
import { ComicScrapingVolumeSelectionComponent } from '../../../comic-books/components/comic-scraping-volume-selection/comic-scraping-volume-selection.component';
import { AsyncPipe } from '@angular/common';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { ComicDetailCoverUrlPipe } from '@app/comic-books/pipes/comic-detail-cover-url.pipe';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { filter, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-scraping-issues-page',
  templateUrl: './scraping-issues-page.component.html',
  styleUrls: ['./scraping-issues-page.component.scss'],
  imports: [
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatButton,
    RouterLink,
    MatIcon,
    MatLabel,
    MatTooltip,
    ComicScrapingComponent,
    MatPaginator,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    ComicScrapingVolumeSelectionComponent,
    AsyncPipe,
    TranslateModule,
    ComicTitlePipe,
    ComicDetailCoverUrlPipe
  ]
})
export class ScrapingIssuesPageComponent implements OnInit {
  readonly displayColumns = [
    'actions',
    'thumbnail',
    'publisher',
    'series',
    'volume',
    'issue-number'
  ];

  dataSource = new MatTableDataSource<DisplayableComic>();
  multiBookScrapingState: MultiBookScrapingState;
  comicBooks$ = new BehaviorSubject<DisplayableComic[]>([]);
  currentComicBook$ = new BehaviorSubject<DisplayableComic | null>(null);
  metadataSource$ = new BehaviorSubject<MetadataSource | null>(null);
  currentSeries$ = new BehaviorSubject('');
  currentVolume$ = new BehaviorSubject('');
  currentIssueNumber$ = new BehaviorSubject('');
  skipCache$ = new BehaviorSubject(false);
  matchPublisher$ = new BehaviorSubject(false);
  maximumRecords$ = new BehaviorSubject(0);
  scrapingVolumes$ = new BehaviorSubject<VolumeMetadata[]>([]);
  selectedIds$ = new BehaviorSubject<number[]>([]);
  showPopup$ = new BehaviorSubject(false);
  popupComic$ = new BehaviorSubject<DisplayableComic | null>(null);

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
    this.store
      .select(selectUser)
      .pipe(
        tap(user => {
          this.skipCache$.next(
            getUserPreference(
              user.preferences,
              SKIP_CACHE_PREFERENCE,
              `${false}`
            ) === `${true}`
          );
          this.matchPublisher$.next(
            getUserPreference(
              user.preferences,
              MATCH_PUBLISHER_PREFERENCE,
              `${false}`
            ) === `${true}`
          );
          this.maximumRecords$.next(
            Number.parseInt(
              getUserPreference(
                user.preferences,
                MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
                '0'
              ),
              10
            )
          );
        })
      )
      .subscribe();
    this.store
      .select(selectMultiBookScrapingState)
      .pipe(
        tap(state => {
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
        })
      )
      .subscribe();
    this.store
      .select(selectMultiBookScrapingList)
      .pipe(
        tap(comicBooks => {
          this.comicBooks$.next(comicBooks);
          this.dataSource.data = comicBooks;
        })
      )
      .subscribe();
    this.store
      .select(selectMultiBookScrapingCurrent)
      .pipe(filter(comicBook => !!comicBook))
      .pipe(
        tap(currentComicBook => {
          this.currentComicBook$.next(currentComicBook);
          this.scrapingVolumes$.next([]);
          this.currentVolume$.next(null);
        })
      )
      .subscribe();
    this.store
      .select(selectChosenMetadataSource)
      .pipe(
        tap(metadataSource => {
          this.metadataSource$.next(metadataSource);
        })
      )
      .subscribe();
    this.store
      .select(selectSingleBookScrapingState)
      .pipe(
        tap(state => {
          this.store.dispatch(setBusyState({ enabled: state.loadingRecords }));
        })
      )
      .subscribe();
    this.store
      .select(selectScrapingVolumeMetadata)
      .pipe(tap(volumes => this.scrapingVolumes$.next(volumes)))
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(
        tap(params => {
          this.store.dispatch(
            loadMultiBookScrapingPage({
              pageSize: this.queryParameterService.pageSize$.value,
              pageNumber: this.queryParameterService.pageIndex$.value
            })
          );
        })
      )
      .subscribe();
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

  onSelectionChanged(comicBook: DisplayableComic): void {
    this.logger.trace('Selected comic changed:', comicBook);
    this.currentComicBook$.next(comicBook);
  }

  onScrape(event: MetadataEvent): void {
    this.logger.trace('Storing comic details');
    this.currentSeries$.next(event.series);
    this.currentVolume$.next(event.volume);
    this.currentIssueNumber$.next(event.issueNumber);
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

  onShowPopup(showPopup: boolean, comic: DisplayableComic): void {
    this.showPopup$.next(showPopup);
    this.popupComic$.next(comic);
  }

  onRemoveComicBook(comicDetail: DisplayableComic) {
    this.store.dispatch(
      multiBookScrapingRemoveBook({
        comicBook: this.comicBooks$.value.find(
          entry => entry.comicBookId === comicDetail.comicBookId
        ),
        pageSize: this.queryParameterService.pageSize$.value
      })
    );
  }

  onSelectComicBook(comicDetail: DisplayableComic): void {
    const comicBook = this.comicBooks$.value.find(
      entry => entry.comicBookId === comicDetail.comicBookId
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
