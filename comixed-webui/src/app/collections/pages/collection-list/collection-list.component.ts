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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
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
import { QUERY_PARAM_FILTER_TEXT } from '@app/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ComicTagType,
  comicTagTypeFromString
} from '@app/comic-books/models/comic-tag-type';

@Component({
  selector: 'cx-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
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
  filterTextForm: FormGroup;

  readonly displayedColumns = ['tag-value', 'comic-count'];
  langChangeSubscription: Subscription;
  protected readonly filter = filter;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private titleService: TitleService,
    private formBuilder: FormBuilder,
    public queryParameterService: QueryParameterService
  ) {
    this.filterTextForm = this.formBuilder.group({ filterTextInput: [''] });
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
        this.filterTextForm.controls['filterTextInput'].setValue(
          this.queryParameterService.filterText$.value || ''
        );
        this.filterTextForm.markAsUntouched();
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

  onApplyFilter(searchText: string): void {
    this.logger.debug('Setting collection search text:', searchText);
    this.queryParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_FILTER_TEXT,
        value: searchText?.length > 0 ? searchText : null
      }
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
