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

import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  loadBlockedHashList,
  markPagesWithHash
} from '@app/comic-pages/actions/blocked-hash-list.actions';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import {
  selectBlockedPageList,
  selectBlockedPageListState
} from '@app/comic-pages/selectors/blocked-hash-list.selectors';
import { Router } from '@angular/router';
import { downloadBlockedPages } from '@app/comic-pages/actions/download-blocked-pages.actions';
import { TranslateService } from '@ngx-translate/core';
import { uploadBlockedPages } from '@app/comic-pages/actions/upload-blocked-pages.actions';
import { deleteBlockedPages } from '@app/comic-pages/actions/delete-blocked-pages.actions';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { TitleService } from '@app/core/services/title.service';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatSort } from '@angular/material/sort';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { MatPaginator } from '@angular/material/paginator';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE
} from '@app/core';

@Component({
  selector: 'cx-blocked-hash-list',
  templateUrl: './blocked-hash-list-page.component.html',
  styleUrls: ['./blocked-hash-list-page.component.scss']
})
export class BlockedHashListPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  hashStateSubscription: Subscription;
  pageSubscription: Subscription;
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  pageSize = PAGE_SIZE_DEFAULT;
  readonly pageOptions = PAGE_SIZE_OPTIONS;
  dataSource = new MatTableDataSource<SelectableListItem<BlockedHash>>([]);
  readonly displayedColumns = [
    'selected',
    'label',
    'hash',
    'comic-count',
    'created-on'
  ];
  hasSelections = false;
  allSelected = false;
  private _blockedHashes: BlockedHash[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.hashStateSubscription = this.store
      .select(selectBlockedPageListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.busy }));
      });
    this.pageSubscription = this.store
      .select(selectBlockedPageList)
      .subscribe(entries => (this.entries = entries));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.pageSize = parseInt(
        getUserPreference(
          user.preferences,
          PAGE_SIZE_PREFERENCE,
          `${PAGE_SIZE_DEFAULT}`
        ),
        10
      );
    });
  }

  get entries(): BlockedHash[] {
    return this._blockedHashes;
  }

  set entries(entries: BlockedHash[]) {
    this._blockedHashes = entries;
    const oldData = this.dataSource.data;
    this.dataSource.data = entries.map(item => {
      const selected =
        oldData.find(entry => entry.item.id === item.id)?.selected || false;
      return { selected, item };
    });
    this.hasSelections = this.dataSource.data.some(entry => entry.selected);
  }

  get selectedHashes(): BlockedHash[] {
    return this.dataSource.data
      .filter(entry => entry.selected)
      .map(entry => entry.item);
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from hash state updates');
    this.hashStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from blocked page list updates');
    this.pageSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscriing from user updates');
    this.userSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.store.dispatch(loadBlockedHashList());
    this.loadTranslations();
  }

  onSelectOne(entry: SelectableListItem<BlockedHash>, checked: boolean): void {
    this.logger.debug('Changing selection to', checked);
    entry.selected = checked;
    this.updateSelections();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'selected':
          return `${data.selected}`;
        case 'label':
          return data.item.label;
        case 'hash':
          return data.item.hash;
        case 'comic-count':
          return data.item.comicCount;
        case 'created-on':
          return data.item.createdOn;
      }
    };
  }

  onDownloadFile(): void {
    this.logger.debug('Download blocked pages file');
    this.store.dispatch(downloadBlockedPages());
  }

  onFileSelected(file: File): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-hash-list.upload-file.confirmation-title'
      ),
      message: this.translateService.instant(
        'blocked-hash-list.upload-file.confirmation-message',
        { filename: file.name }
      ),
      confirm: () => {
        this.logger.debug('Uploading blocked pages file:', file);
        this.store.dispatch(uploadBlockedPages({ file }));
      }
    });
  }

  onDeleteEntries(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-hash-list.delete-entries.confirmation-title'
      ),
      message: this.translateService.instant(
        'blocked-hash-list.delete-entries.confirmation-message',
        { count: this.dataSource.data.filter(entry => entry.selected).length }
      ),
      confirm: () => {
        const entries = this.dataSource.data
          .filter(entry => entry.selected)
          .map(entry => entry.item);
        this.logger.debug('Deleting selected blocked pages:', entries);
        this.store.dispatch(deleteBlockedPages({ entries }));
      }
    });
  }

  onMarkSelectedForDeletion(): void {
    this.logger.trace('Confirming marking selected pages for deletion');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-hash-list.mark-pages-with-hash.confirm-mark-title'
      ),
      message: this.translateService.instant(
        'blocked-hash-list.mark-pages-with-hash.confirm-mark-message'
      ),
      confirm: () => {
        this.logger.trace(
          'Firing action: mark selected blocked pages for deletion'
        );
        this.doSetDeletionFlag(true);
      }
    });
  }

  onClearSelectedForDeletion(): void {
    this.logger.trace('Confirming clearing selected pages for deletion');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-hash-list.mark-pages-with-hash.confirm-clear-title'
      ),
      message: this.translateService.instant(
        'blocked-hash-list.mark-pages-with-hash.confirm-clear-message'
      ),
      confirm: () => {
        this.logger.trace(
          'Firing action: clearing selected blocked pages for deletion'
        );
        this.doSetDeletionFlag(false);
      }
    });
  }

  onSelectAll(checked: boolean): void {
    this.logger.trace('Selecting all:', checked);
    this.dataSource.data.forEach(entry => (entry.selected = checked));
    this.updateSelections();
  }

  private doSetDeletionFlag(deleted: boolean): void {
    this.store.dispatch(
      markPagesWithHash({
        hashes: this.dataSource.data
          .filter(entry => entry.selected)
          .map(entry => entry.item.hash),
        deleted
      })
    );
  }

  private updateSelections(): void {
    this.allSelected = this.dataSource.data.every(entry => entry.selected);
    this.hasSelections =
      this.allSelected ||
      this.dataSource.data.some(listEntry => listEntry.selected);
  }

  private loadTranslations(): void {
    this.logger.trace('Loading tab title');
    this.titleService.setTitle(
      this.translateService.instant('blocked-hash-list.tab-title')
    );
  }
}
