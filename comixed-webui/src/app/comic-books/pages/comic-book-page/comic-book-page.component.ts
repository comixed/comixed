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

import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BusyIcon, setBusyStateWithIcon } from '@app/core/actions/busy.actions';
import {
  selectUserIsAdmin,
  selectUserMatchPublisher,
  selectUserMaximumRecords,
  selectUserPageSize,
  selectUserSkipCache
} from '@app/user/selectors/user.selectors';
import { interpolate, PAGE_SIZE_DEFAULT } from '@app/core';
import {
  loadVolumeMetadata,
  resetMetadataState
} from '@app/comic-metadata/actions/single-book-scraping.actions';
import {
  selectChosenMetadataSource,
  selectScrapingVolumeMetadata,
  selectSingleBookScrapingBusy
} from '@app/comic-metadata/selectors/single-book-scraping.selectors';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import {
  comicBookLoaded,
  downloadComicBook,
  loadComicBook,
  savePageOrder
} from '@app/comic-books/actions/comic-book.actions';
import { selectComicBookState } from '@app/comic-books/selectors/comic-book.selectors';
import { TitleService } from '@app/core/services/title.service';
import { WebSocketService } from '@app/messaging';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { updateSingleComicBookMetadata } from '@app/library/actions/update-metadata.actions';
import {
  deleteSingleComicBook,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import { COMIC_BOOK_UPDATE_TOPIC } from '@app/comic-books/comic-books.constants';
import { ComicPage } from '@app/comic-books/models/comic-page';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ComicState } from '@app/comic-books/models/comic-state';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { markSingleComicBookRead } from '@app/user/actions/read-comic-books.actions';
import { selectReadComicBooksList } from '@app/user/selectors/read-comic-books.selectors';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { ComicPageComponent } from '../../components/comic-page/comic-page.component';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ComicDetailEditComponent } from '../../components/comic-detail-edit/comic-detail-edit.component';
import { ComicStoryComponent } from '../../components/comic-story/comic-story.component';
import { ComicPagesComponent } from '../../components/comic-pages/comic-pages.component';
import { ComicScrapingComponent } from '../../components/comic-scraping/comic-scraping.component';
import { ComicScrapingVolumeSelectionComponent } from '../../components/comic-scraping-volume-selection/comic-scraping-volume-selection.component';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ComicPageUrlPipe } from '@app/comic-books/pipes/comic-page-url.pipe';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { LoadComicBookResponse } from '@app/comic-books/models/net/load-comic-book-response';
import { ComicTag } from '@app/comic-books/models/comic-tag';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'cx-comic-book-page',
  templateUrl: './comic-book-page.component.html',
  styleUrls: ['./comic-book-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    RouterLink,
    MatIcon,
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    ComicPageComponent,
    MatCardFooter,
    MatIconButton,
    MatTabGroup,
    MatTab,
    ComicDetailEditComponent,
    ComicStoryComponent,
    ComicPagesComponent,
    ComicScrapingComponent,
    ComicScrapingVolumeSelectionComponent,
    AsyncPipe,
    DatePipe,
    TranslateModule,
    ComicPageUrlPipe,
    ComicTitlePipe
  ]
})
export class ComicBookPageComponent implements OnInit, AfterViewInit {
  metadataSource: MetadataSource | null = null;
  comicId = -1;
  pageIndex = 0;
  comic: DisplayableComic | null = null;
  tags: ComicTag[] = [];
  pages: ComicPage[];
  isAdmin$ = of(false);
  pageSize$ = of(PAGE_SIZE_DEFAULT);
  pageNumber$ = new BehaviorSubject(0);
  skipCache$ = of(false);
  matchPublisher$ = of(false);
  maximumRecords$ = of(0);
  volumes: VolumeMetadata[] = [];
  scrapingSeriesName = '';
  scrapingVolume = '';
  scrapingIssueNumber = '';
  readComicBookList$ = new BehaviorSubject<number[]>([]);

  messagingStarted = false;
  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  comicTitlePipe = inject(ComicTitlePipe);
  confirmationService = inject(ConfirmationService);
  webSocketService = inject(WebSocketService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.translateService.onLangChange.subscribe(() => this.loadTranslations());
    this.activatedRoute.params.subscribe(params => {
      this.comicId = +params.comicId;
      this.logger.trace('ComicBook id parameter:', params.comicBookId);
      this.store.dispatch(loadComicBook({ id: this.comicId }));
      this.subscribeToUpdates();
    });
    this.store.select(selectSingleBookScrapingBusy).subscribe({
      next: busy =>
        this.store.dispatch(
          setBusyStateWithIcon({
            enabled: busy,
            icon: BusyIcon.LOADING
          })
        )
    });
    this.store
      .select(selectComicBookState)
      .pipe(filter(state => !!state?.detail))
      .subscribe({
        next: state => {
          this.comic = state.detail;
          this.metadataSource = state.metadata?.metadataSource;
          this.pages = state.pages;
          this.tags = state.tags;
          this.loadPageTitle();
        }
      });
    this.store.select(selectChosenMetadataSource).subscribe({
      next: metadataSource => (this.metadataSource = metadataSource)
    });
    this.isAdmin$ = this.store.select(selectUserIsAdmin);
    this.pageSize$ = this.store.select(selectUserPageSize);
    this.skipCache$ = this.store.select(selectUserSkipCache);
    this.matchPublisher$ = this.store.select(selectUserMatchPublisher);
    this.maximumRecords$ = this.store.select(selectUserMaximumRecords);
    this.store.select(selectReadComicBooksList).subscribe({
      next: readComicBookList => this.readComicBookList$.next(readComicBookList)
    });
    this.store
      .select(selectScrapingVolumeMetadata)
      .subscribe(volumes => (this.volumes = volumes));
    this.store.select(selectMessagingState).subscribe(state => {
      this.messagingStarted = state.started;
      if (state.started) {
        this.subscribeToUpdates();
      }
    });
  }

  get hasChangedState(): boolean {
    return this.comic.comicState === ComicState.CHANGED;
  }

  get isDeleted(): boolean {
    return this.comic.comicState === ComicState.DELETED;
  }

  get isRead$(): Observable<boolean> {
    return of(
      this.readComicBookList$.value.includes(this.comic?.comicDetailId)
    );
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngAfterViewInit(): void {
    this.store.dispatch(resetMetadataState());
  }

  onLoadScrapingVolumes(args: {
    metadataSource: MetadataSource;
    publisher: string;
    series: string;
    volume: string;
    issueNumber: string;
    maximumRecords: number;
    skipCache: boolean;
    matchPublisher: boolean;
  }): void {
    this.logger.trace('Loading scraping volumes:', args);
    this.scrapingSeriesName = args.series;
    this.scrapingVolume = args.volume;
    this.scrapingIssueNumber = args.issueNumber;
    this.metadataSource = args.metadataSource;
    this.store.dispatch(
      loadVolumeMetadata({
        metadataSource: args.metadataSource,
        publisher: args.publisher,
        series: args.series,
        maximumRecords: args.maximumRecords,
        skipCache: args.skipCache,
        matchPublisher: args.matchPublisher
      })
    );
  }

  setReadState(read: boolean): void {
    this.logger.debug('Marking comic read status:', read);
    this.store.dispatch(
      markSingleComicBookRead({
        comicDetailId: this.comic.comicDetailId,
        read
      })
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
        this.logger.debug('Updating comic file:', this.comic);
        this.store.dispatch(
          updateSingleComicBookMetadata({
            comicBookId: this.comic.comicBookId
          })
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
            deleteSingleComicBook({
              comicBookId: this.comic.comicBookId
            })
          );
        } else {
          this.store.dispatch(
            undeleteSingleComicBook({
              comicBookId: this.comic.comicBookId
            })
          );
        }
      }
    });
  }

  onPagesChanged(pages: ComicPage[]): void {
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
            comicBookId: this.comic.comicBookId,
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

  onDownloadComicFile(): void {
    this.logger.debug('Downloading comic file');
    this.store.dispatch(
      downloadComicBook({ comicBookId: this.comic.comicBookId })
    );
  }

  private loadTranslations(): void {
    this.loadPageTitle();
  }

  private loadPageTitle(): void {
    if (this.comic) {
      this.logger.trace('Updating page title');
      this.titleService.setTitle(this.comicTitlePipe.transform(this.comic));
    }
  }

  private subscribeToUpdates(): void {
    const topic = interpolate(COMIC_BOOK_UPDATE_TOPIC, { id: this.comicId });
    this.logger.trace('Subscribing to comic book updates:', topic);
    this.webSocketService.subscribe<LoadComicBookResponse>(topic, data => {
      this.logger.debug('ComicBook book update received:', data);
      this.store.dispatch(
        comicBookLoaded({
          detail: data.detail,
          metadata: data.metadata,
          pages: data.pages,
          tags: data.tags
        })
      );
    });
  }
}
