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

import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { PublisherDetailStore } from '@app/collections/stores/publisher-detail-store';
import { MatPaginator } from '@angular/material/paginator';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CollectionService } from '@app/collections/services/collection-service';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Series } from '@app/collections/models/series';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';

@Component({
  imports: [
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTable,
    TranslatePipe,
    MatNoDataRow,
    MatHeaderCellDef,
    MatCard,
    MatCardTitle,
    MatCardContent
  ],
  selector: 'app-publisher-detail-page',
  styleUrl: './publisher-detail-page.scss',
  templateUrl: './publisher-detail-page.html'
})
export class PublisherDetailPage implements AfterViewInit {
  @ViewChild('mat-paginator') paginator!: MatPaginator;

  readonly logger = inject(LoggerService);
  readonly collectionsService = inject(CollectionService);
  readonly publisherDetailStore = inject(PublisherDetailStore);
  readonly dataSource = new MatTableDataSource<Series>([]);
  readonly displayedColumns = ['series-name', 'volume', 'in-library'];
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);

  publisherName = '';

  constructor() {
    this.logger.trace('Subscribing to router parameter updates');
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        if (!params.has('publisherName')) {
          this.logger.error('Missing publisher name');
          this.router.navigateByUrl('/');
        }
        this.collectionsService.loadPublisherDetail({
          name: params.get('publisherName')!,
          index: 0,
          size: 10,
          sortBy: '',
          sortDirection: ''
        });
      }
    });
    this.logger.trace('Subscribing to collection entry list updates');
    toObservable<Series[]>(this.publisherDetailStore.series)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: data => {
          this.logger.trace('Series list update received:', data);
          this.dataSource.data = data;
        }
      });
    this.translateService.onLangChange.subscribe({
      next: () => {
        this.doLoadTranslations();
      }
    });
    this.doLoadTranslations();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Connecting paginator');
    this.dataSource.paginator = this.paginator;
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publisher-detail-page.page-title'
      )
    );
  }
}
