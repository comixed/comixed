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
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import {
  downloadBlockedHashesFile,
  loadBlockedHashList,
  markPagesWithHash,
  uploadBlockedHashesFile
} from '@app/comic-pages/actions/blocked-hashes.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { deleteBlockedPages } from '@app/comic-pages/actions/delete-blocked-pages.actions';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { TitleService } from '@app/core/services/title.service';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  selectBlockedHashesList,
  selectBlockedHashesState
} from '@app/comic-pages/selectors/blocked-hashes.selectors';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { AsyncPipe, DatePipe } from '@angular/common';
import { BlockedHashThumbnailUrlPipe } from '../../pipes/blocked-hash-thumbnail-url.pipe';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-blocked-hash-list',
  templateUrl: './blocked-hash-list-page.component.html',
  styleUrls: ['./blocked-hash-list-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCheckbox,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    RouterLink,
    AsyncPipe,
    DatePipe,
    TranslateModule,
    BlockedHashThumbnailUrlPipe
  ]
})
export class BlockedHashListPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly pageOptions = PAGE_SIZE_OPTIONS;
  readonly displayedColumns = [
    'selected',
    'thumbnail',
    'label',
    'hash',
    'comic-count',
    'created-on'
  ];

  dataSource = new MatTableDataSource<SelectableListItem<BlockedHash>>([]);

  hasSelections$ = new BehaviorSubject(false);
  allSelected$ = new BehaviorSubject(false);
  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  store = inject(Store<any>);
  router = inject(Router);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  private _blockedHashes: BlockedHash[] = [];

  constructor() {
    this.store
      .select(selectBlockedHashesState)
      .pipe(
        tap(state => {
          this.store.dispatch(setBusyState({ enabled: state.busy }));
        })
      )
      .subscribe();
    this.store
      .select(selectBlockedHashesList)
      .pipe(tap(entries => (this.entries = entries)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
  }

  get entries(): BlockedHash[] {
    return this._blockedHashes;
  }

  set entries(entries: BlockedHash[]) {
    this._blockedHashes = entries;
    const oldData = this.dataSource.data;
    this.dataSource.data = entries.map(item => {
      const selected =
        oldData.find(entry => entry.item.blockedHashId === item.blockedHashId)
          ?.selected || false;
      return { selected, item };
    });
    this.hasSelections$.next(
      this.dataSource.data.some(entry => entry.selected)
    );
  }

  get selectedHashes(): BlockedHash[] {
    return this.dataSource.data
      .filter(entry => entry.selected)
      .map(entry => entry.item);
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
    this.store.dispatch(downloadBlockedHashesFile());
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
        this.store.dispatch(uploadBlockedHashesFile({ file }));
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
    this.logger.debug('Confirming marking selected pages for deletion');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-hash-list.mark-pages-with-hash.confirm-mark-title'
      ),
      message: this.translateService.instant(
        'blocked-hash-list.mark-pages-with-hash.confirm-mark-message'
      ),
      confirm: () => {
        this.logger.debug(
          'Firing action: mark selected blocked pages for deletion'
        );
        this.doSetDeletionFlag(true);
      }
    });
  }

  onClearSelectedForDeletion(): void {
    this.logger.debug('Confirming clearing selected pages for deletion');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-hash-list.mark-pages-with-hash.confirm-clear-title'
      ),
      message: this.translateService.instant(
        'blocked-hash-list.mark-pages-with-hash.confirm-clear-message'
      ),
      confirm: () => {
        this.logger.debug(
          'Firing action: clearing selected blocked pages for deletion'
        );
        this.doSetDeletionFlag(false);
      }
    });
  }

  onSelectAll(checked: boolean): void {
    this.logger.debug('Selecting all:', checked);
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
    this.allSelected$.next(this.dataSource.data.every(entry => entry.selected));
    this.hasSelections$.next(
      this.allSelected$.value ||
        this.dataSource.data.some(listEntry => listEntry.selected)
    );
  }

  private loadTranslations(): void {
    this.logger.debug('Loading tab title');
    this.titleService.setTitle(
      this.translateService.instant('blocked-hash-list.tab-title')
    );
  }
}
