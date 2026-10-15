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
import { PublisherDetailStore } from '@app/collections/stores/publisher-detail-store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CollectionService } from '@app/collections/services/collection-service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Card } from '@openng/optimus-ui/card';
import { TableModule } from '@openng/optimus-ui/table';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';

@Component({
  imports: [Card, TableModule, TranslatePipe, RouterLink, Breadcrumb],
  selector: 'app-publisher-detail-page',
  styleUrl: './publisher-detail-page.scss',
  templateUrl: './publisher-detail-page.html'
})
export class PublisherDetailPage {
  readonly logger = inject(LoggerService);
  readonly collectionsService = inject(CollectionService);
  readonly publisherDetailStore = inject(PublisherDetailStore);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly trail = signal<MenuItem[]>([]);

  publisherName = '';

  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };

  constructor() {
    this.logger.trace('Subscribing to router parameter updates');
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.publisherName = params.get('publisherName')!;
        this.collectionsService.loadPublisherDetail({
          name: this.publisherName,
          index: 0,
          size: 10,
          sortBy: '',
          sortDirection: ''
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
      this.translateService.instant('publisher-detail-page.page-title', {
        name: this.publisherName
      })
    );
    this.trail.set([{ label: this.publisherName }]);
  }
}
