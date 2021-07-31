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
import { Comic } from '@app/comic-book/models/comic';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference, isAdmin } from '@app/user/user.functions';
import { updateQueryParam } from '@app/core';
import {
  API_KEY_PREFERENCE,
  MAXIMUM_RECORDS_PREFERENCE,
  PAGE_SIZE_DEFAULT,
  QUERY_PARAM_TAB,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { selectDisplayState } from '@app/library/selectors/display.selectors';
import {
  loadScrapingVolumes,
  resetScraping
} from '@app/comic-book/actions/scraping.actions';
import {
  selectScrapingState,
  selectScrapingVolumes
} from '@app/comic-book/selectors/scraping.selectors';
import { ScrapingVolume } from '@app/comic-book/models/scraping-volume';
import { TranslateService } from '@ngx-translate/core';
import { ComicTitlePipe } from '@app/comic-book/pipes/comic-title.pipe';
import { loadComic } from '@app/comic-book/actions/comic.actions';
import {
  selectComic,
  selectComicBusy
} from '@app/comic-book/selectors/comic.selectors';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { updateComicReadStatus } from '@app/last-read/actions/update-read-status.actions';
import { LastRead } from '@app/last-read/models/last-read';
import { TitleService } from '@app/core/services/title.service';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { updateComicInfo } from '@app/comic-book/actions/update-comic-info.actions';

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
  comicId = -1;
  pageIndex = 0;
  comic: Comic;
  userSubscription: Subscription;
  isAdmin = false;
  displaySubscription: Subscription;
  pageSize = PAGE_SIZE_DEFAULT;
  volumesSubscription: Subscription;
  apiKey = '';
  skipCache = false;
  maximumRecords = 0;
  volumes: ScrapingVolume[] = [];
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

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private titleService: TitleService,
    private translateService: TranslateService,
    private comicTitlePipe: ComicTitlePipe,
    private confirmationService: ConfirmationService
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.comicId = +params.comicId;
      this.logger.trace('Comic id parameter:', params.comicId);
      this.store.dispatch(loadComic({ id: this.comicId }));
    });
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        if (+params[QUERY_PARAM_TAB]) {
          this.currentTab = +params[QUERY_PARAM_TAB];
          this.updateShowPages();
        }
      }
    );
    this.scrapingStateSubscription = this.store
      .select(selectScrapingState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.loadingRecords }))
      );
    this.comicSubscription = this.store.select(selectComic).subscribe(comic => {
      this.comic = comic;
      this.loadPageTitle();
    });
    this.comicBusySubscription = this.store
      .select(selectComicBusy)
      .subscribe(busy => this.store.dispatch(setBusyState({ enabled: busy })));

    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.isAdmin = isAdmin(user);
      this.apiKey = getUserPreference(
        user.preferences,
        API_KEY_PREFERENCE,
        this.apiKey
      );
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
    this.displaySubscription = this.store
      .select(selectDisplayState)
      .subscribe(state => {
        this.pageSize = state.pageSize;
      });
    this.volumesSubscription = this.store
      .select(selectScrapingVolumes)
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
    this.userSubscription.unsubscribe();
    this.volumesSubscription.unsubscribe();
    this.lastReadSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.store.dispatch(resetScraping());
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

  private updateShowPages(): void {
    this.showPages = this.showPages || this.currentTab === 2;
  }

  onLoadScrapingVolumes(
    apiKey: string,
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
      loadScrapingVolumes({ apiKey, series, maximumRecords, skipCache })
    );
  }

  setReadState(status: boolean): void {
    this.logger.debug(`Marking comic as ${status ? 'read' : 'unread'}`);
    this.store.dispatch(updateComicReadStatus({ comic: this.comic, status }));
  }

  private routeToComic(id: number): void {
    this.router.navigate(['library', 'comics', id], {
      queryParamsHandling: 'preserve'
    });
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

  onUpdateComicInfo(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.update-comic-info.confirmation-title'
      ),
      message: this.translateService.instant(
        'comic-book.update-comic-info.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Updating comic file:', this.comic);
        this.store.dispatch(updateComicInfo({ comic: this.comic }));
      }
    });
  }
}
