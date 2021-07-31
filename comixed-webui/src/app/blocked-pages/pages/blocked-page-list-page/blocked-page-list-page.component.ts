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

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { loadBlockedPageList } from '@app/blocked-pages/actions/blocked-page-list.actions';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { selectBlockedPageList } from '@app/blocked-pages/selectors/blocked-page-list.selectors';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { downloadBlockedPages } from '@app/blocked-pages/actions/download-blocked-pages.actions';
import { TranslateService } from '@ngx-translate/core';
import { uploadBlockedPages } from '@app/blocked-pages/actions/upload-blocked-pages.actions';
import { deleteBlockedPages } from '@app/blocked-pages/actions/delete-blocked-pages.actions';
import { BlockedPage } from '@app/blocked-pages/models/blocked-page';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { ConfirmationService } from '@app/core/services/confirmation.service';

@Component({
  selector: 'cx-blocked-page-list',
  templateUrl: './blocked-page-list-page.component.html',
  styleUrls: ['./blocked-page-list-page.component.scss']
})
export class BlockedPageListPageComponent implements OnInit, AfterViewInit {
  @ViewChild('MatPagination') paginator: MatPaginator;

  pageSubscription: Subscription;
  dataSource = new MatTableDataSource<SelectableListItem<BlockedPage>>([]);
  readonly displayedColumns = [
    'selected',
    'label',
    'hash',
    'comic-count',
    'created-on'
  ];
  showUploadRow = false;
  hasSelections = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.pageSubscription = this.store
      .select(selectBlockedPageList)
      .subscribe(entries => {
        const oldData = this.dataSource.data;
        this.dataSource.data = entries.map(item => {
          const selected =
            oldData.find(entry => entry.item.id === item.id)?.selected || false;
          return { selected, item };
        });
        this.hasSelections = this.dataSource.data.some(entry => entry.selected);
      });
  }

  ngOnInit(): void {
    this.store.dispatch(loadBlockedPageList());
  }

  onChangeSelection(
    entry: SelectableListItem<BlockedPage>,
    checked: boolean
  ): void {
    this.logger.debug('Changing selection to', checked);
    entry.selected = checked;
    this.hasSelections = this.dataSource.data.some(
      listEntry => listEntry.selected
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onOpenBlockedPageDetails(entry: SelectableListItem<BlockedPage>): void {
    this.logger.debug('Opening blocked page:', entry.item);
    this.router.navigate(['/admin', 'pages', 'blocked', entry.item.hash]);
  }

  onDownloadFile(): void {
    this.logger.debug('Download blocked pages file');
    this.store.dispatch(downloadBlockedPages());
  }

  onShowUploadRow(): void {
    this.logger.debug('Showing upload row');
    this.showUploadRow = true;
  }

  onFileSelected(event: any): void {
    event.stopPropagation();
    this.showUploadRow = false;
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-page-list.upload-file.confirmation-title'
      ),
      message: this.translateService.instant(
        'blocked-page-list.upload-file.confirmation-message'
      ),
      confirm: () => {
        const file = event.target.files[0];
        this.logger.debug('Uploading blocked pages file:', file);
        this.store.dispatch(uploadBlockedPages({ file }));
        this.store.dispatch(uploadBlockedPages({ file }));
      }
    });
  }

  onDeleteEntries(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'blocked-page-list.delete-entries.confirmation-title'
      ),
      message: this.translateService.instant(
        'blocked-page-list.delete-entries.confirmation-message',
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
}
