/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  clearSelectedComicBooks,
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';
import { Store } from '@ngrx/store';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { Router } from '@angular/router';
import { LastRead } from '@app/last-read/models/last-read';
import { ComicContextMenuEvent } from '@app/comic-books/models/event/comic-context-menu-event';
import { ReadingList } from '@app/lists/models/reading-list';

@Component({
  selector: 'cx-comic-detail-list-view',
  templateUrl: './comic-detail-list-view.component.html',
  styleUrls: ['./comic-detail-list-view.component.scss']
})
export class ComicDetailListViewComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;

  @Input() isAdmin = false;
  @Input() lastReadDates: LastRead[] = [];
  @Input() readingLists: ReadingList[] = [];
  @Input() extraFieldTitle = '';
  @Input() followClick = true;
  @Input() usePopups = true;
  showPopup = false;
  currentComic: ComicDetail;
  @Output() showContextMenu = new EventEmitter<ComicContextMenuEvent>();

  @Input() showSelection = true;
  @Input() showThumbnail = true;
  @Input() showArchiveType = true;
  @Input() showComicState = true;
  @Input() showPublisher = true;
  @Input() showSeries = true;
  @Input() showVolume = true;
  @Input() showIssueNumber = true;
  @Input() showCoverDate = true;
  @Input() showStoreDate = true;
  @Input() showLastReadDate = false;
  @Input() showAddedDate = true;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router,
    public queryParameterService: QueryParameterService
  ) {}

  get displayedColumns(): string[] {
    return [
      this.showSelection ? 'selection' : null,
      this.showThumbnail ? 'thumbnail' : null,
      this.showArchiveType ? 'archive-type' : null,
      this.showComicState ? 'comic-state' : null,
      this.showPublisher ? 'publisher' : null,
      this.showSeries ? 'series' : null,
      this.showVolume ? 'volume' : null,
      this.showIssueNumber ? 'issue-number' : null,
      this.showCoverDate ? 'cover-date' : null,
      this.showStoreDate ? 'store-date' : null,
      this.showLastReadDate ? 'last-read-date' : null,
      this.showAddedDate ? 'added-date' : null
    ].filter(entry => !!entry);
  }

  private _selectedIds: number[] = [];

  get selectedIds(): number[] {
    return this._selectedIds;
  }

  @Input() set selectedIds(selectedIds: number[]) {
    this._selectedIds = selectedIds;
    this.dataSource.data.forEach(
      entry => (entry.selected = this.selectedIds.includes(entry.item.id))
    );
  }

  private _dataSource: MatTableDataSource<SelectableListItem<ComicDetail>>;

  get dataSource(): MatTableDataSource<SelectableListItem<ComicDetail>> {
    return this._dataSource;
  }

  @Input()
  set dataSource(
    dataSource: MatTableDataSource<SelectableListItem<ComicDetail>>
  ) {
    this.logger.trace('Setting data source');
    this._dataSource = dataSource;
    this.logger.trace('Setting up filtering');
    /* istanbul ignore next */
    this._dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter.toLowerCase());
    };
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up sorting');
    this._dataSource.sort = this.sort;
    this.logger.trace('Configuring sort');
    this._dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'selection':
          return `${data.selected}`;
        case 'archive-type':
          return data.item.archiveType.toString();
        case 'comic-state':
          return data.item.comicState.toString();
        case 'publisher':
          return data.item.publisher;
        case 'series':
          return data.item.series;
        case 'volume':
          return data.item.volume;
        case 'issue-number':
          return data.item.issueNumber;
        case 'cover-date':
          return data.item.coverDate;
        case 'store-date':
          return data.item.storeDate;
        case 'last-read-date':
          return this.lastReadDate(data.item);
        case 'extra-field':
          return data.sortableExtraField;
        default:
          this.logger.error(`Invalid sort column: ${sortHeaderId}`);
          return null;
      }
    };
  }

  toggleSelected(comic: SelectableListItem<ComicDetail>): void {
    if (!comic.selected) {
      this.logger.debug('Selecting comic:', comic.item);
      this.store.dispatch(selectComicBooks({ ids: [comic.item.id] }));
    } else {
      this.logger.debug('Deselecting comic:', comic.item);
      this.store.dispatch(deselectComicBooks({ ids: [comic.item.id] }));
    }
  }

  getIconForState(comicState: ComicBookState): string {
    switch (comicState) {
      case ComicBookState.ADDED:
        return 'add';
      case ComicBookState.UNPROCESSED:
        return 'bolt';
      case ComicBookState.STABLE:
        return 'check_circle';
      case ComicBookState.CHANGED:
        return 'change_circle';
      case ComicBookState.DELETED:
        return 'delete';
    }
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.logger.debug('Selecting all comics');
      const ids = this.dataSource.filteredData.map(entry => entry.item.id);
      this.store.dispatch(selectComicBooks({ ids }));
    } else {
      this.logger.debug('Deselecting all comics');
      this.store.dispatch(clearSelectedComicBooks());
    }
  }

  onSelectOne(entry: SelectableListItem<ComicDetail>, checked: boolean): void {
    if (checked) {
      this.logger.debug('Selecting comic:', entry.item);
      this.store.dispatch(selectComicBooks({ ids: [entry.item.id] }));
    } else {
      this.logger.debug('Deselecting comic:', entry.item);
      this.store.dispatch(deselectComicBooks({ ids: [entry.item.id] }));
    }
  }

  onRowSelected(row: SelectableListItem<ComicDetail>): void {
    if (this.followClick) {
      this.router.navigate(['/comics', row.item.comicId]);
    }
  }

  onShowPopup(show: boolean, comic: ComicDetail): void {
    this.logger.debug('Setting show pup:', show, this.usePopups);
    this.showPopup = show && this.usePopups;
    this.currentComic = comic;
  }

  isRead(comic: ComicDetail): boolean {
    return this.lastReadDates
      .map(entry => entry.comicDetail.id)
      .includes(comic.id);
  }

  lastReadDate(comic: ComicDetail): number {
    return this.lastReadDates.find(
      entry => entry.comicDetail.comicId === comic.comicId
    )?.lastRead;
  }
}
