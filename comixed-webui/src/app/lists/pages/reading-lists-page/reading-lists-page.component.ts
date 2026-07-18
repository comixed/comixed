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
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ReadingList } from '@app/lists/models/reading-list';
import {
  deleteReadingLists,
  loadReadingLists
} from '@app/lists/actions/reading-lists.actions';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  selectUserReadingLists,
  selectUserReadingListsBusy
} from '@app/lists/selectors/reading-lists.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { uploadReadingList } from '@app/lists/actions/upload-reading-list.actions';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { TitleService } from '@app/core/services/title.service';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { MatFabButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatCheckbox } from '@angular/material/checkbox';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'cx-reading-lists-page',
  templateUrl: './reading-lists-page.component.html',
  styleUrls: ['./reading-lists-page.component.scss'],
  imports: [
    MatFabButton,
    RouterLink,
    MatTooltip,
    MatIcon,
    MatToolbar,
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
    AsyncPipe,
    DecimalPipe,
    DatePipe,
    TranslateModule
  ]
})
export class ReadingListsPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<SelectableListItem<ReadingList>>([]);

  readonly displayedColumns = [
    'selection',
    'list-name',
    'summary',
    'comic-count',
    'created-on'
  ];
  showUploadRow$ = new BehaviorSubject(false);
  hasSelections$ = new BehaviorSubject(false);
  allSelected$ = new BehaviorSubject(false);

  logger = inject(LoggerService);
  store = inject(Store);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.store
      .select(selectUserReadingListsBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectUserReadingLists)
      .pipe(tap(readingLists => (this.readingLists = readingLists)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
  }

  private _readingLists: ReadingList[] = [];

  get readingLists(): ReadingList[] {
    return this._readingLists;
  }

  set readingLists(readingLists: ReadingList[]) {
    this.logger.trace('Received reading lists update');
    this._readingLists = readingLists;
    this.logger.trace('Loading reading lists data source');
    const oldData = this.dataSource.data;
    this.dataSource.data = readingLists.map(list => {
      const oldEntry = oldData.find(
        entry => entry.item.readingListId === list.readingListId
      );

      return {
        item: list,
        selected: oldEntry?.selected || false
      };
    });
  }

  ngOnInit(): void {
    this.logger.trace('Loading all user reading lists');
    this.store.dispatch(loadReadingLists());
    this.loadTranslations();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Assigning table sort');
    this.dataSource.sort = this.sort;
    this.logger.trace('Setting up sort');
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'selection':
          return `${data.selected}`;
        case 'list-name':
          return data.item.name;
        case 'comic-count':
          return data.item.entryIds.length;
        case 'created-on':
          return data.item.createdOn;
      }
    };
    this.logger.trace('Assigning table paginator');
    this.dataSource.paginator = this.paginator;
  }

  onToggleUploadReadingLists(): void {
    this.logger.trace('Showing upload row');
    this.showUploadRow$.next(!this.showUploadRow$.value);
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
    this.showUploadRow$.next(false);
  }

  onSelectAll(selected: boolean): void {
    this.logger.trace('Setting all selected:', selected);
    this.dataSource.data.forEach(entry => (entry.selected = selected));
    this.updateSelectedState();
  }

  onSelectOne(entry: SelectableListItem<ReadingList>, selected: boolean): void {
    this.logger.trace('Setting one selected:', entry, selected);
    entry.selected = selected;
    this.updateSelectedState();
  }

  onDeleteReadingLists(): void {
    this.logger.trace('Confirming deleting reading lists');
    const lists = this.dataSource.data
      .filter(entry => entry.selected)
      .map(entry => entry.item);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'reading-lists.delete-reading-lists.confirmation-title'
      ),
      message: this.translateService.instant(
        'reading-lists.delete-reading-lists.confirmation-message',
        { count: lists.length }
      ),
      confirm: () => {
        this.logger.trace('Firing action to delete reading lists');
        this.store.dispatch(deleteReadingLists({ lists }));
      }
    });
  }

  private updateSelectedState(): void {
    this.allSelected$.next(this.dataSource.data.every(entry => entry.selected));
    this.hasSelections$.next(
      this.allSelected$.value ||
        this.dataSource.data.some(entry => entry.selected)
    );
  }

  private loadTranslations(): void {
    this.logger.trace('Loading reading lists tab title');
    this.titleService.setTitle(
      this.translateService.instant('reading-lists.tab-title')
    );
  }
}
