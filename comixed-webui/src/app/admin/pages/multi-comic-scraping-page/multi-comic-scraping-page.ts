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

import { Component, inject, OnInit, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  selectMultiComicScrapingBusy,
  selectMultiComicScrapingEntries,
  selectMultiComicScrapingTotal,
  selectMultiComicsScrapingCurrent
} from '@app/metadata/selectors/multi-comic-scraping.selectors';
import { ConfirmationService, MenuItem } from '@openng/optimus-ui/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TitleService } from '@app/layout/services/title-service';
import { MultiComicScrapingActions } from '@app/metadata/actions/multi-comic-scraping.actions';
import { Button } from '@openng/optimus-ui/button';
import { Card } from '@openng/optimus-ui/card';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { TableModule } from '@openng/optimus-ui/table';
import { ComicCoverUrlPipe } from '@app/library/pipes/comic-cover-url-pipe';
import { ComicMetadataDetail } from '@app/library/components/comic-metadata-detail/comic-metadata-detail';
import { ComicCover } from '@app/library/components/comic-cover/comic-cover';
import { ScrapingIssueSelectedEvent } from '@app/library/models/ux/scraping-issue-selected-event';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Comic } from '@app/library/models/comic';

@Component({
  imports: [
    Button,
    Card,
    Breadcrumb,
    TableModule,
    TranslatePipe,
    ComicCoverUrlPipe,
    ComicMetadataDetail,
    ComicCover,
    Tooltip
  ],
  selector: 'app-multi-comic-scraping-page',
  styleUrl: './multi-comic-scraping-page.scss',
  templateUrl: './multi-comic-scraping-page.html'
})
export class MultiComicScrapingPage implements OnInit {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly store = inject(Store);
  readonly confirmationService = inject(ConfirmationService);

  readonly multiComicScrapingEntries = this.store.selectSignal(
    selectMultiComicScrapingEntries
  );
  readonly multiComicScrapingBusy = this.store.selectSignal(
    selectMultiComicScrapingBusy
  );
  readonly multiComicScrapingTotal = this.store.selectSignal(
    selectMultiComicScrapingTotal
  );
  readonly multiComicScrapingIndex = signal(0);
  readonly multiComicScrapingRows = signal(10);
  readonly multiComicScrapingCurrentComic = this.store.selectSignal(
    selectMultiComicsScrapingCurrent
  );

  readonly trail = signal<MenuItem[]>([]);
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe({ next: () => this.doLoadTranslations() });
    this.doLoadTranslations();
  }

  ngOnInit(): void {
    this.store.dispatch(
      MultiComicScrapingActions.loadComics({
        index: this.multiComicScrapingIndex(),
        size: this.multiComicScrapingRows()
      })
    );
  }

  onShowComicList(): void {
    this.store.dispatch(
      MultiComicScrapingActions.setCurrentComic({ entry: null })
    );
  }

  onRemoveComic(comic: Comic): void {
    this.store.dispatch(
      MultiComicScrapingActions.removeComic({ entry: comic })
    );
  }

  onSetCurrentComic(comic: Comic) {
    this.store.dispatch(
      MultiComicScrapingActions.setCurrentComic({ entry: comic })
    );
  }

  onIssueSelected(event: ScrapingIssueSelectedEvent): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'multi-comic-scraping-page.issue-selected.confirmation-title'
      ),
      message: this.translateService.instant(
        'multi-comic-scraping-page.issue-selected.confirmation-message'
      ),
      accept: () => {
        this.logger.debug('Initiating scraping a comic:', event);
        this.store.dispatch(
          MultiComicScrapingActions.scrapeComic({
            comic: this.multiComicScrapingCurrentComic()!,
            metadataSource: event.metadataSource,
            issueId: event.issue.id,
            skipCache: event.skipCache,
            index: 0,
            size: 10
          })
        );
      }
    });
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('multi-comic-scraping-page.page-title')
    );
    this.trail.set([
      {
        label: this.translateService.instant(
          'multi-comic-scraping-page.tab-title'
        )
      }
    ]);
  }
}
