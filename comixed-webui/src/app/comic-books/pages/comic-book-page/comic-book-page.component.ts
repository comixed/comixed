/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import {
  getPageSize,
  getUserPreference,
  isAdmin
} from '@app/user/user.functions';
import { interpolate, PAGE_SIZE_DEFAULT } from '@app/core';
import {
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import {
  loadVolumeMetadata,
  resetMetadataState,
  setChosenMetadataSource
} from '@app/comic-metadata/actions/single-book-scraping.actions';
import {
  selectChosenMetadataSource,
  selectSingleBookScrapingState,
  selectScrapingVolumeMetadata
} from '@app/comic-metadata/selectors/single-book-scraping.selectors';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { TranslateService } from '@ngx-translate/core';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import {
  comicBookLoaded,
  loadComicBook,
  savePageOrder
} from '@app/comic-books/actions/comic-book.actions';
import {
  selectComicBook,
  selectComicBookBusy
} from '@app/comic-books/selectors/comic-book.selectors';
import { selectComicBookLastReadEntries } from '@app/comic-books/selectors/last-read-list.selectors';
import { LastRead } from '@app/comic-books/models/last-read';
import { TitleService } from '@app/core/services/title.service';
import { MessagingSubscription, WebSocketService } from '@app/messaging';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { markSingleComicBookRead } from '@app/comic-books/actions/comic-books-read.actions';
import { updateSingleComicBookMetadata } from '@app/library/actions/update-metadata.actions';
import {
  deleteSingleComicBook,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import { COMIC_BOOK_UPDATE_TOPIC } from '@app/comic-books/comic-books.constants';
import { Page } from '@app/comic-books/models/page';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ComicState } from '@app/comic-books/models/comic-state';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { QueryParameterService } from '@app/core/services/query-parameter.service';

@Component({
  selector: 'cx-comic-book-page',
  templateUrl: './comic-book-page.component.html',
  styleUrls: ['./comic-book-page.component.scss']
})
export class ComicBookPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  paramSubscription: Subscription;
  scrapingStateSubscription: Subscription;
  comicSubscription: Subscription;
  comicUpdateSubscription: MessagingSubscription;
  metadataSourceSubscription: Subscription;
  metadataSource: MetadataSource;
  messagingSubscription: Subscription;
  comicId = -1;
  pageIndex = 0;
  comicBook: ComicBook;
  pages: Page[];
  userSubscription: Subscription;
  isAdmin = false;
  pageSize = PAGE_SIZE_DEFAULT;
  volumesSubscription: Subscription;
  skipCache = false;
  maximumRecords = 0;
  volumes: VolumeMetadata[] = [];
  scrapingSeriesName = '';
  scrapingVolume = '';
  scrapingIssueNumber = '';
  langChangeSubscription: Subscription;
  comicBusySubscription: Subscription;
  lastReadSubscription: Subscription;
  lastReadDates: LastRead[] = [];
  isRead = false;
  lastRead: LastRead = null;
  messagingStarted = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private queryParameterService: QueryParameterService,
    private titleService: TitleService,
    private translateService: TranslateService,
    private comicTitlePipe: ComicTitlePipe,
    private confirmationService: ConfirmationService,
    private webSocketService: WebSocketService
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.comicId = +params.comicId;
      this.unsubscribeFromUpdates();
      this.logger.trace('ComicBook id parameter:', params.comicId);
      this.store.dispatch(loadComicBook({ id: this.comicId }));
    });
    this.scrapingStateSubscription = this.store
      .select(selectSingleBookScrapingState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.loadingRecords }))
      );
    this.comicSubscription = this.store
      .select(selectComicBook)
      .subscribe(comic => {
        this.comicBook = comic;
        if (!!this.comicBook?.metadata) {
          this.logger.trace('Preselecting previous metadata source');
          this.store.dispatch(
            setChosenMetadataSource({
              metadataSource: this.comicBook.metadata.metadataSource
            })
          );
        }
        this.loadPageTitle();
        this.subscribeToUpdates();
      });
    this.comicBusySubscription = this.store
      .select(selectComicBookBusy)
      .subscribe(busy => this.store.dispatch(setBusyState({ enabled: busy })));
    this.metadataSourceSubscription = this.store
      .select(selectChosenMetadataSource)
      .subscribe(metadataSource => (this.metadataSource = metadataSource));
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.isAdmin = isAdmin(user);
      this.logger.trace('Loading uer page size preference');
      this.pageSize = getPageSize(user);
      this.skipCache =
        getUserPreference(
          user.preferences,
          SKIP_CACHE_PREFERENCE,
          `${this.skipCache === true}`
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
    this.volumesSubscription = this.store
      .select(selectScrapingVolumeMetadata)
      .subscribe(volumes => (this.volumes = volumes));
    this.lastReadSubscription = this.store
      .select(selectComicBookLastReadEntries)
      .subscribe(entries => {
        this.isRead = entries
          .map(entry => entry.comicDetail.comicId)
          .includes(this.comicId);
        this.lastRead =
          entries.find(entry => entry.comicDetail.comicId === this.comicId) ||
          null;
      });
    this.messagingSubscription = this.store
      .select(selectMessagingState)
      .subscribe(state => {
        this.messagingStarted = state.started;
        if (state.started) {
          this.subscribeToUpdates();
        }
        if (!state.started) {
          this.unsubscribeFromUpdates();
        }
      });
  }

  get hasChangedState(): boolean {
    return this.comicBook.detail.comicState === ComicState.CHANGED;
  }

  get isDeleted(): boolean {
    return this.comicBook.detail.comicState === ComicState.DELETED;
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe();
    this.paramSubscription.unsubscribe();
    this.scrapingStateSubscription.unsubscribe();
    this.comicSubscription.unsubscribe();
    this.comicBusySubscription.unsubscribe();
    this.metadataSourceSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.volumesSubscription.unsubscribe();
    this.lastReadSubscription.unsubscribe();
    if (!!this.comicUpdateSubscription) {
      this.comicUpdateSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.store.dispatch(resetMetadataState());
  }

  onLoadScrapingVolumes(
    series: string,
    volume: string,
    issueNumber: string,
    maximumRecords: number,
    skipCache: boolean
  ): void {
    this.logger.trace('Loading scraping volumes');
    this.scrapingSeriesName = series;
    this.scrapingVolume = volume;
    this.scrapingIssueNumber = issueNumber;
    this.store.dispatch(
      loadVolumeMetadata({
        metadataSource: this.metadataSource,
        series,
        maximumRecords,
        skipCache
      })
    );
  }

  setReadState(read: boolean): void {
    this.logger.debug('Marking comic read status:', read);
    this.store.dispatch(
      markSingleComicBookRead({ comicBookId: this.comicBook.id, read })
    );
  }

  onUpdateMetadata(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: 1 }
      ),
      confirm: () => {
        this.logger.debug('Updating comic file:', this.comicBook);
        this.store.dispatch(
          updateSingleComicBookMetadata({ comicBookId: this.comicBook.id })
        );
      }
    });
  }

  onDeleteComicBook(deleted: boolean): void {
    this.logger.trace('Confirming setting comic deleted state');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.deleted-state.confirmation-title',
        { deleted }
      ),
      message: this.translateService.instant(
        'comic-book.deleted-state.confirmation-message',
        { deleted }
      ),
      confirm: () => {
        this.logger.trace('Marking comic for deletion');
        if (deleted) {
          this.store.dispatch(
            deleteSingleComicBook({ comicBookId: this.comicBook.id })
          );
        } else {
          this.store.dispatch(
            undeleteSingleComicBook({ comicBookId: this.comicBook.id })
          );
        }
      }
    });
  }

  unsubscribeFromUpdates(): void {
    if (!!this.comicUpdateSubscription) {
      this.logger.trace('Unsubscribing from comic book updates');
      this.comicUpdateSubscription.unsubscribe();
      this.comicUpdateSubscription = null;
    }
  }

  onPagesChanged(pages: Page[]): void {
    this.pages = pages;
  }

  onSavePageOrder(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.save-page-order.confirmation-title'
      ),
      message: this.translateService.instant(
        'comic-book.save-page-order.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Firing event: save page order');
        this.store.dispatch(
          savePageOrder({
            comicBook: this.comicBook,
            entries: this.pages.map((page, index) => {
              return {
                index,
                filename: page.filename
              };
            })
          })
        );
      }
    });
  }

  private loadTranslations(): void {
    this.loadPageTitle();
  }

  private loadPageTitle(): void {
    if (!!this.comicBook) {
      this.logger.trace('Updating page title');
      this.titleService.setTitle(
        this.comicTitlePipe.transform(this.comicBook.detail)
      );
    }
  }

  private subscribeToUpdates(): void {
    if (!this.comicUpdateSubscription && this.messagingStarted) {
      this.logger.trace('Subscribing to comic book updates');
      this.comicUpdateSubscription = this.webSocketService.subscribe<ComicBook>(
        interpolate(COMIC_BOOK_UPDATE_TOPIC, { id: this.comicId }),
        comic => {
          this.logger.debug('ComicBook book update received:', comic);
          this.store.dispatch(comicBookLoaded({ comicBook: comic }));
        }
      );
    }
  }
}
