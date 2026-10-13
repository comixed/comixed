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
import { PublisherStore } from '@app/collections/stores/publishers-store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CollectionService } from '@app/collections/services/collection-service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Publisher } from '@app/collections/models/publisher';
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
import { MatPaginator } from '@angular/material/paginator';
import { TitleService } from '@app/layout/services/title-service';

@Component({
  imports: [
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatHeaderCellDef,
    TranslatePipe,
    MatCellDef,
    MatRowDef,
    MatTable,
    MatColumnDef,
    MatNoDataRow,
    MatPaginator
  ],
  selector: 'app-publisher-list-page',
  styleUrl: './publisher-list-page.scss',
  templateUrl: './publisher-list-page.html'
})
export class PublisherListPage implements OnInit, AfterViewInit {
  @ViewChild('mat-paginator') paginator!: MatPaginator;

  readonly logger = inject(LoggerService);
  readonly collectionsService = inject(CollectionService);
  readonly publisherStore = inject(PublisherStore);
  readonly dataSource = new MatTableDataSource<Publisher>([]);
  readonly displayedColumns = ['publisher-name', 'issue-count', 'series-count'];
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);

  constructor() {
    this.logger.trace('Subscribing to publisher list updates');
    toObservable<Publisher[]>(this.publisherStore.publishers)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: data => {
          this.logger.trace('Publisher list update received:', data);
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
    this.logger.trace('Loading all publishers');
    this.collectionsService.loadPublishers({
      searchText: this.publisherStore.searchText(),
      index: this.publisherStore.index(),
      size: this.publisherStore.size(),
      sortBy: this.publisherStore.sortBy(),
      sortDirection: this.publisherStore.sortDirection()
    });
  }

  ngAfterViewInit(): void {
    this.logger.trace('Connecting paginator');
    this.dataSource.paginator = this.paginator;
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publisher-list-page.page-title'
      )
    );
  }
}
