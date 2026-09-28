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

import { Component, inject } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CollectionService } from '@app/collections/services/collection-service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesDetailStore } from '@app/collections/stores/series-detail-store';
import { Card } from '@openng/optimus-ui/card';
import { TableModule } from '@openng/optimus-ui/table';
import { DatePipe } from '@angular/common';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';

@Component({
  imports: [Card, TranslatePipe, TableModule, DatePipe, Breadcrumb],
  selector: 'app-series-detail-page',
  styleUrl: './series-detail-page.scss',
  templateUrl: './series-detail-page.html'
})
export class SeriesDetailPage {
  readonly logger = inject(LoggerService);
  readonly collectionsService = inject(CollectionService);
  readonly seriesDetailStore = inject(SeriesDetailStore);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);

  publisherName = '';
  trail: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.logger.trace('Subscribing to router parameter updates');
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        const publisher = params.get('publisherName')!;
        const series = params.get('seriesName')!;
        const volume = params.get('volume')!;
        this.trail = [
          {
            label: publisher,
            routerLink: ['/collections/publishers', publisher]
          },
          { label: series },
          { label: volume }
        ];
        this.seriesDetailStore.setSeries(publisher, series, volume);
        this.collectionsService.loadSeriesDetail({
          publisherName: publisher,
          seriesName: series,
          volume
        });
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publisher-detail-page.page-title'
      )
    );
  }
}
