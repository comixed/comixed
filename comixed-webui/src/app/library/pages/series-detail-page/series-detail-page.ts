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
import { LoggerService } from '@angular-ru/cdk/logger';
import { CollectionService } from '@app/library/services/collection-service';
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
  readonly trail = signal<MenuItem[]>([]);

  publisher = '';
  series = '';
  volume = '';
  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.logger.trace('Subscribing to router parameter updates');
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.publisher = params.get('publisherName')!;
        this.series = params.get('seriesName')!;
        this.volume = params.get('volume')!;
        this.seriesDetailStore.setSeries(
          this.publisher,
          this.series,
          this.volume
        );
        this.collectionsService.loadSeriesDetail({
          publisherName: this.publisher,
          seriesName: this.series,
          volume: this.volume
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
        'collections.series-detail-page.page-title',
        { name: this.series, volume: this.volume }
      )
    );
    this.trail.set([
      {
        label: this.publisher,
        routerLink: ['/library/publishers', this.publisher]
      },
      {
        label: this.translateService.instant('series-detail-page.page-title', {
          name: this.series,
          volume: this.volume
        })
      }
    ]);
  }
}
