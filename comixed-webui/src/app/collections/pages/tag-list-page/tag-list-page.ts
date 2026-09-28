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
import { ActivatedRoute, Router } from '@angular/router';
import {
  ComicTagType,
  comicTagTypeFromString
} from '@app/library/models/comic-tag-type';
import { TagStore } from '@app/collections/stores/tag-store';
import { CollectionEntry } from '@app/collections/models/collection-entry';

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
    MatHeaderCellDef,
    MatNoDataRow
  ],
  selector: 'app-tag-list-page',
  styleUrl: './tag-list-page.scss',
  templateUrl: './tag-list-page.html'
})
export class TagListPage implements AfterViewInit {
  @ViewChild('mat-paginator') paginator!: MatPaginator;

  readonly logger = inject(LoggerService);
  readonly collectionsService = inject(CollectionService);
  readonly tagStore = inject(TagStore);
  readonly dataSource = new MatTableDataSource<CollectionEntry>([]);
  readonly displayedColumns = ['tag-value', 'comic-count'];
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);

  tagType!: ComicTagType;

  constructor() {
    this.logger.trace('Subscribing to router parameter updates');
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        if (!params.has('tagType')) {
          this.logger.error('Missing tag type');
          this.router.navigateByUrl('/');
        }
        const typeParameter = params.get('tagType');
        this.logger.trace('Extracting tag type');
        const providedType = comicTagTypeFromString(typeParameter || '');
        if (providedType) {
          this.tagType = providedType;
          this.logger.debug('Tag type:', this.tagType);
          this.collectionsService.loadCollectionEntries({
            tagType: this.tagType,
            searchText: '',
            index: 0,
            size: 10,
            sortBy: '',
            sortDirection: ''
          });
        } else {
          this.logger.error('Invalid tag type:', typeParameter);
          this.router.navigateByUrl('/');
        }
      }
    });
    this.logger.trace('Subscribing to collection entry list updates');
    toObservable<CollectionEntry[]>(this.tagStore.entries)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: data => {
          this.logger.trace('Collection entry list update received:', data);
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
      this.translateService.instant('collections.series-list-page.page-title')
    );
  }
}
