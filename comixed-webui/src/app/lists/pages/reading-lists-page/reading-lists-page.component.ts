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
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import { ReadingList } from '@app/lists/models/reading-list';
import { loadReadingLists } from '@app/lists/actions/reading-lists.actions';
import { MatSort } from '@angular/material/sort';
import {
  selectUserReadingLists,
  selectUserReadingListsState
} from '@app/lists/selectors/reading-lists.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { uploadReadingList } from '@app/lists/actions/upload-reading-list.actions';
import { selectUploadReadingListState } from '@app/lists/selectors/upload-reading-list.selectors';

@Component({
  selector: 'cx-reading-lists-page',
  templateUrl: './reading-lists-page.component.html',
  styleUrls: ['./reading-lists-page.component.scss']
})
export class ReadingListsPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<ReadingList>([]);
  readingListStateSubscription: Subscription;
  readingListsSubscription: Subscription;
  uploadReadingListSubscription: Subscription;

  readonly displayedColumns = [
    'list-name',
    'summary',
    'comic-count',
    'created-on'
  ];
  showUploadRow = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Subscribing to reading list state updates');
    this.readingListStateSubscription = this.store
      .select(selectUserReadingListsState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
      });
    this.logger.trace('Suscribing to user reading list updates');
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(readingLists => (this.readingLists = readingLists));
    this.uploadReadingListSubscription = this.store
      .select(selectUploadReadingListState)
      .subscribe(state => {
        this.logger.trace('Uploading reading list state change');
        this.store.dispatch(setBusyState({ enabled: state.uploading }));
      });
  }

  private _readingLists: ReadingList[];

  set readingLists(readingLists: ReadingList[]) {
    this.logger.trace('Received reading lists update');
    this._readingLists = readingLists;
    this.logger.trace('Loading reading lists data source');
    this.dataSource.data = readingLists;
  }

  ngOnInit(): void {
    this.logger.trace('Loading all user reading lists');
    this.store.dispatch(loadReadingLists());
  }

  ngAfterViewInit(): void {
    this.logger.trace('Assigning table sort');
    this.dataSource.sort = this.sort;
    this.logger.trace('Setting up sort');
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'list-name':
          return data.name;
        case 'comic-count':
          return data.comics.length;
        case 'created-on':
          return data.createdOn;
      }
    };
    this.logger.trace('Assigning table paginator');
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from user reading list state updates');
    this.readingListStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user reading list updates');
    this.readingListsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from upload reading list state updates');
    this.uploadReadingListSubscription.unsubscribe();
  }

  onShowUploadRow(): void {
    this.logger.trace('Showing upload row');
    this.showUploadRow = true;
  }

  onFileSelected(file: File): void {
    this.logger.trace('Confirming uploading reading list file');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'reading-list.upload-file.confirmation-title'
      ),
      message: this.translateService.instant(
        'reading-list.upload-file.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Firing upload reading list action');
        this.store.dispatch(uploadReadingList({ file }));
      }
    });
    this.logger.trace('Hiding upload row');
    this.showUploadRow = false;
  }
}
