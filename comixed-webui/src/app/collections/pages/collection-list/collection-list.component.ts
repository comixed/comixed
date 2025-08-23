/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  selectCollectionListEntries,
  selectCollectionListState,
  selectCollectionListTotalEntries
} from '@app/collections/selectors/collection-list.selectors';
import { CollectionEntry } from '@app/collections/models/collection-entry';
import { loadCollectionList } from '@app/collections/actions/collection-list.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { filter } from 'rxjs/operators';
import {
  ComicTagType,
  comicTagTypeFromString
} from '@app/comic-books/models/comic-tag-type';
import { FilterTextFormComponent } from '../../components/filter-text-form/filter-text-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'cx-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss'],
  imports: [
    FilterTextFormComponent,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    AsyncPipe,
    DecimalPipe,
    TranslateModule
  ]
})
export class CollectionListComponent implements OnInit, OnDestroy {
  paramSubscription: Subscription;
  queryParamSubscription: Subscription;
  collectionType: ComicTagType;
  routableTypeName: string;
  collectionStateSubscription: Subscription;
  collectionEntrySubscription: Subscription;
  totalEntriesSubscription: Subscription;
  totalEntries = 0;
  dataSource = new MatTableDataSource<CollectionEntry>([]);

  readonly displayedColumns = ['tag-value', 'comic-count'];
  langChangeSubscription: Subscription;
  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  protected readonly filter = filter;

  constructor() {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.routableTypeName = params.collectionType;
      this.collectionType = comicTagTypeFromString(this.routableTypeName);
      if (!this.collectionType) {
        this.logger.error('Invalid collection type:', params.collectionType);
        this.router.navigateByUrl('/library');
      } else {
        this.loadTranslations();
      }
    });
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      () => {
        this.store.dispatch(
          loadCollectionList({
            tagType: this.collectionType,
            searchText: this.queryParameterService.filterText$.value,
            pageSize: this.queryParameterService.pageSize$.value,
            pageIndex: this.queryParameterService.pageIndex$.value,
            sortBy: this.queryParameterService.sortBy$.value,
            sortDirection: this.queryParameterService.sortDirection$.value
          })
        );
      }
    );
    this.collectionStateSubscription = this.store
      .select(selectCollectionListState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.collectionEntrySubscription = this.store
      .select(selectCollectionListEntries)
      .subscribe(entries => (this.entries = entries));
    this.totalEntriesSubscription = this.store
      .select(selectCollectionListTotalEntries)
      .subscribe(totalEntries => (this.totalEntries = totalEntries));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  set entries(entries: CollectionEntry[]) {
    this.logger.debug('Setting collection entries:', entries);
    this.dataSource.data = entries;
  }

  ngOnDestroy(): void {
    this.paramSubscription.unsubscribe();
    this.queryParamSubscription.unsubscribe();
    this.collectionStateSubscription.unsubscribe();
    this.collectionEntrySubscription.unsubscribe();
    this.totalEntriesSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  onShowCollection(entry: CollectionEntry): void {
    this.logger.debug('Collection entry selected:', entry);
    this.router.navigate([
      '/library',
      'collections',
      this.routableTypeName,
      entry.tagValue
    ]);
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collection-list.tab-title', {
        collection: this.collectionType
      })
    );
  }
}
