/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, inject, signal } from '@angular/core';
import { Card } from '@openng/optimus-ui/card';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { ComicTitlePipe } from '@app/library/pipes/comic-title-pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ComicDetailAction } from '@app/library/actions/comic-detail.actions';
import {
  selectComicDetail,
  selectComicDetailLoaded,
  selectComicDetailPages,
  selectComicDetailTags
} from '@app/library/selectors/comic-detail.selectors';
import { ComicDetailTrailPipe } from '@app/library/pipes/comic-detail-trail-pipe';
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@openng/optimus-ui/tabs';
import { ComicCover } from '@app/library/components/comic-cover/comic-cover';
import { ComicPagesDetail } from '@app/library/components/comic-pages-detail/comic-pages-detail';
import { ComicStoryDetail } from '@app/library/components/comic-story-detail/comic-story-detail';
import { ComicMetadataDetail } from '@app/library/components/comic-metadata-detail/comic-metadata-detail';
import { ComicPublicationDetail } from '@app/library/components/comic-publication-detail/comic-publication-detail';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import {
  COMIC_UPDATE_TOPIC,
  QUERY_PARAM_COMIC_DETAIL_TAB
} from '@app/library/library-constants';
import { WebSocketService } from '@app/messaging/services/web-socket-service';
import { LoadComicDetailResponse } from '@app/library/models/net/load-comic-detail-response';
import { interpolate } from '@app/app-functions';
import { Comic } from '@app/library/models/comic';
import { Badge } from '@openng/optimus-ui/badge';

@Component({
  imports: [
    Card,
    Breadcrumb,
    TranslatePipe,
    ComicDetailTrailPipe,
    ComicTitlePipe,
    Tabs,
    Tab,
    TabList,
    TabPanels,
    TabPanel,
    ComicCover,
    ComicPagesDetail,
    ComicStoryDetail,
    ComicMetadataDetail,
    ComicPublicationDetail,
    Badge
  ],
  selector: 'app-comic-detail-page',
  styleUrl: './comic-detail-page.scss',
  templateUrl: './comic-detail-page.html'
})
export class ComicDetailPage {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly queryParameterService = inject(QueryParameterService);
  readonly store = inject(Store);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly titleService = inject(TitleService);
  readonly comicTitlePipe = new ComicTitlePipe();
  readonly webSocketService = inject(WebSocketService);

  readonly loading = this.store.selectSignal(selectComicDetailLoaded);
  readonly comic = this.store.selectSignal(selectComicDetail);
  readonly tags = this.store.selectSignal(selectComicDetailTags);
  readonly pages = this.store.selectSignal(selectComicDetailPages);
  readonly currentTab = signal('publication');

  comicId = 0;
  trail = signal<MenuItem[]>([]);
  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.activatedRoute.params.subscribe({
      next: params => {
        const comicId = +params['comicId'];
        this.logger.info('Loading comic by id:', comicId);
        this.store.dispatch(ComicDetailAction.load({ comicId }));
        this.logger.debug('Subscribing to updates for comicId:', comicId);
        this.webSocketService.subscribe<LoadComicDetailResponse>(
          interpolate(COMIC_UPDATE_TOPIC, { comicId }),
          payload => {
            this.logger.debug('Received comic update:', payload);
            this.store.dispatch(
              ComicDetailAction.updateReceived({
                comic: payload.detail,
                pages: payload.pages,
                tags: payload.tags,
                metadata: payload.metadata
              })
            );
          }
        );
      }
    });
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        if (params[QUERY_PARAM_COMIC_DETAIL_TAB]) {
          this.logger.debug('Loading tab from query params:', params);
          this.currentTab.set(params[QUERY_PARAM_COMIC_DETAIL_TAB]);
        }
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
    this.doLoadTranslations();
  }

  onTabChanged(tabName: number | string | undefined): void {
    this.logger.debug('Changing comic detail tabs:', tabName);
    this.queryParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_COMIC_DETAIL_TAB,
        value: !tabName ? null : `${tabName}`
      }
    ]);
  }

  onUpdateComic(comic: Comic): void {
    this.logger.trace('Firing action to update comic');
    this.store.dispatch(ComicDetailAction.save({ comic }));
  }

  private doLoadTranslations() {
    const pageTitle = this.comicTitlePipe.transform(this.comic());
    this.titleService.setTitle(pageTitle);
  }
}
