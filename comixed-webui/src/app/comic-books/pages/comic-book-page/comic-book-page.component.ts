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
import { Comic } from '@app/comic-books/models/comic';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import {
  getPageSize,
  getUserPreference,
  isAdmin
} from '@app/user/user.functions';
import { interpolate, updateQueryParam } from '@app/core';
import {
  MAXIMUM_RECORDS_PREFERENCE,
  PAGE_SIZE_DEFAULT,
  QUERY_PARAM_PAGES_AS_GRID,
  QUERY_PARAM_TAB,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import {
  loadVolumeMetadata,
  resetMetadataState
} from '@app/comic-metadata/actions/metadata.actions';
import {
  selectChosenMetadataSource,
  selectMetadataState,
  selectVolumeMetadata
} from '@app/comic-metadata/selectors/metadata.selectors';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { TranslateService } from '@ngx-translate/core';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import {
  comicLoaded,
  loadComic,
  savePageOrder
} from '@app/comic-books/actions/comic.actions';
import {
  selectComic,
  selectComicBusy
} from '@app/comic-books/selectors/comic.selectors';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { LastRead } from '@app/last-read/models/last-read';
import { TitleService } from '@app/core/services/title.service';
import { MessagingSubscription, WebSocketService } from '@app/messaging';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { setComicsRead } from '@app/last-read/actions/set-comics-read.actions';
import { updateMetadata } from '@app/library/actions/update-metadata.actions';
import { markComicsDeleted } from '@app/comic-books/actions/mark-comics-deleted.actions';
import { COMIC_BOOK_UPDATE_TOPIC } from '@app/comic-books/comic-books.constants';
import { Page } from '@app/comic-books/models/page';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

@Component({
  selector: 'cx-comic-book-page',
  templateUrl: './comic-book-page.component.html',
  styleUrls: ['./comic-book-page.component.scss']
})
export class ComicBookPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  paramSubscription: Subscription;
  queryParamSubscription: Subscription;
  currentTab = 0;
  scrapingStateSubscription: Subscription;
  comicSubscription: Subscription;
  comicUpdateSubscription: MessagingSubscription;
  metadataSourceSubscription: Subscription;
  metadataSource: MetadataSource;
  messagingSubscription: Subscription;
  comicId = -1;
  pageIndex = 0;
  comic: Comic;
  pages: Page[];
  userSubscription: Subscription;
  isAdmin = false;
  displaySubscription: Subscription;
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
  showPages = false;
  messagingStarted = false;
  showPagesAsGrid = true;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
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
      this.logger.trace('Comic id parameter:', params.comicId);
      this.store.dispatch(loadComic({ id: this.comicId }));
    });
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        if (+params[QUERY_PARAM_TAB]) {
          this.currentTab = +params[QUERY_PARAM_TAB];
          this.updateShowPages();
        }
        if (!!params[QUERY_PARAM_PAGES_AS_GRID]) {
          this.showPagesAsGrid = params[QUERY_PARAM_PAGES_AS_GRID] === 'true';
        }
      }
    );
    this.scrapingStateSubscription = this.store
      .select(selectMetadataState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.loadingRecords }))
      );
    this.comicSubscription = this.store.select(selectComic).subscribe(comic => {
      this.comic = comic;
      this.loadPageTitle();
      this.subscribeToUpdates();
    });
    this.comicBusySubscription = this.store
      .select(selectComicBusy)
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
        getUserPreference(user.preferences, MAXIMUM_RECORDS_PREFERENCE, '0'),
        10
      );
    });
    this.volumesSubscription = this.store
      .select(selectVolumeMetadata)
      .subscribe(volumes => (this.volumes = volumes));
    this.lastReadSubscription = this.store
      .select(selectLastReadEntries)
      .subscribe(entries => {
        this.isRead = entries
          .map(entry => entry.comic.id)
          .includes(this.comicId);
        this.lastRead =
          entries.find(entry => entry.comic.id === this.comicId) || null;
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

  get isDeleted(): boolean {
    return this.comic.comicState === ComicBookState.DELETED;
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

  onTabChange(index: number): void {
    this.logger.trace('Changing active tab:', index);
    updateQueryParam(
      this.activatedRoute,
      this.router,
      QUERY_PARAM_TAB,
      `${index}`
    );
    this.updateShowPages();
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
    this.store.dispatch(setComicsRead({ comics: [this.comic], read }));
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
        this.logger.debug('Updating comic file:', this.comic);
        this.store.dispatch(updateMetadata({ comics: [this.comic] }));
      }
    });
  }

  onSetComicDeletedState(deleted: boolean): void {
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
        this.store.dispatch(
          markComicsDeleted({ comics: [this.comic], deleted })
        );
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

  onTogglePageView(): void {
    this.logger.trace('Toggling showing pages as grid');
    this.showPagesAsGrid = !this.showPagesAsGrid;
    updateQueryParam(
      this.activatedRoute,
      this.router,
      QUERY_PARAM_PAGES_AS_GRID,
      `${this.showPagesAsGrid}`
    );
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
            comic: this.comic,
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

  private updateShowPages(): void {
    this.showPages = this.showPages || this.currentTab === 2;
  }

  private loadTranslations(): void {
    this.loadPageTitle();
  }

  private loadPageTitle(): void {
    if (!!this.comic) {
      this.logger.trace('Updating page title');
      this.titleService.setTitle(this.comicTitlePipe.transform(this.comic));
    }
  }

  private subscribeToUpdates(): void {
    if (!this.comicUpdateSubscription && this.messagingStarted) {
      this.logger.trace('Subscribing to comic book updates');
      this.comicUpdateSubscription = this.webSocketService.subscribe<Comic>(
        interpolate(COMIC_BOOK_UPDATE_TOPIC, { id: this.comicId }),
        comic => {
          this.logger.debug('Comic book update received:', comic);
          this.store.dispatch(comicLoaded({ comic }));
        }
      );
    }
  }
}
