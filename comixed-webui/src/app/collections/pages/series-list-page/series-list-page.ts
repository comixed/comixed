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
import { CollectionService } from '@app/collections/services/collection-service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { SeriesListStore } from '@app/collections/stores/series-list-store';
import { Card } from '@openng/optimus-ui/card';
import { TableModule } from '@openng/optimus-ui/table';
import { RouterLink } from '@angular/router';
import { MenuItem } from '@openng/optimus-ui/api';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';

@Component({
  imports: [TranslatePipe, Card, TableModule, RouterLink, Breadcrumb],
  selector: 'app-series-list-page',
  styleUrl: './series-list-page.scss',
  templateUrl: './series-list-page.html'
})
export class SeriesListPage implements OnInit {
  readonly logger = inject(LoggerService);
  readonly collectionsService = inject(CollectionService);
  readonly seriesListStore = inject(SeriesListStore);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly trail = signal<MenuItem[]>([]);

  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  ngOnInit(): void {
    this.logger.trace('Loading series list');
    this.collectionsService.loadSeriesList({
      searchText: this.seriesListStore.searchText(),
      index: this.seriesListStore.index(),
      size: this.seriesListStore.size(),
      sortBy: this.seriesListStore.sortBy(),
      sortDirection: this.seriesListStore.sortDirection()
    });
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('series-list-page.page-title')
    );
    this.trail.set([
      {
        label: this.translateService.instant('series-list-page.page-title')
      }
    ]);
  }
}
