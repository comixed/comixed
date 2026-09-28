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

import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
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
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { SeriesListStore } from '@app/collections/stores/series-list-store';
import { Series } from '@app/collections/models/series';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';

@Component({
  imports: [
    TranslatePipe,
    MatPaginator,
    MatTable,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatNoDataRow,
    MatHeaderRowDef,
    MatRowDef,
    MatColumnDef,
    RouterLink,
    MatIcon,
    MatTooltip,
    MatCard,
    MatCardActions,
    MatCardTitle,
    MatCardContent
  ],
  selector: 'app-series-list-page',
  styleUrl: './series-list-page.scss',
  templateUrl: './series-list-page.html'
})
export class SeriesListPage implements OnInit, AfterViewInit {
  @ViewChild('mat-paginator') paginator!: MatPaginator;

  readonly logger = inject(LoggerService);
  readonly collectionsService = inject(CollectionService);
  readonly seriesListStore = inject(SeriesListStore);
  readonly dataSource = new MatTableDataSource<Series>([]);
  readonly displayedColumns = [
    'series-name',
    'publisher',
    'volume',
    'in-library'
  ];
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);

  constructor() {
    this.logger.trace('Subscribing to series list updates');
    toObservable<Series[]>(this.seriesListStore.series)
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

  ngAfterViewInit(): void {
    this.logger.trace('Connecting paginator');
    this.dataSource.paginator = this.paginator;
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('collections.series-list-page.page-title')
    );
  }
}
