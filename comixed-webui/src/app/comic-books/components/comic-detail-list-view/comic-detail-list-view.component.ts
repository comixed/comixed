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
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { convertComics } from '@app/library/actions/convert-comics.actions';
import { archiveTypeFromString } from '@app/comic-books/archive-type.functions';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { addComicsToReadingList } from '@app/lists/actions/reading-list-entries.actions';
import { setComicBooksRead } from '@app/last-read/actions/set-comics-read.actions';
import { markComicsDeleted } from '@app/comic-books/actions/mark-comics-deleted.actions';
import { editMultipleComics } from '@app/library/actions/library.actions';
import { EditMultipleComicsComponent } from '@app/library/components/edit-multiple-comics/edit-multiple-comics.component';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { MatDialog } from '@angular/material/dialog';

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

  @Input() showAction = true;
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
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    public queryParameterService: QueryParameterService
  ) {}

  get displayedColumns(): string[] {
    return [
      this.showAction ? 'action' : null,
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
    /* istanbul ignore next */
    const ids = this.dataSource.filteredData.map(entry => entry.item.id);
    if (checked) {
      this.logger.debug('Selecting all comics');
      this.store.dispatch(selectComicBooks({ ids }));
    } else {
      this.logger.debug('Deselecting all comics');
      this.store.dispatch(deselectComicBooks({ ids }));
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
    return !!this.lastReadDate(comic);
  }

  lastReadDate(comic: ComicDetail): number {
    return this.lastReadDates.find(
      entry => !!comic && entry.comicDetail.id === comic.id
    )?.lastRead;
  }

  onContextMenu(mouseEvent: MouseEvent) {
    this.logger.trace('Stop mouse event propagation');
    mouseEvent.stopPropagation();
    this.logger.debug('Firing context menu event:', this.currentComic);
    this.showContextMenu.emit({
      comic: this.currentComic,
      x: mouseEvent.clientX,
      y: mouseEvent.clientY
    } as ComicContextMenuEvent);
  }

  onConvertOne(archiveTypeString: string): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.convert-comics.convert-one.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.convert-comics.convert-one.confirmation-message',
        { format: archiveTypeString }
      ),
      confirm: () => {
        this.logger.debug(
          'Converting comic:',
          this.currentComic,
          archiveTypeString
        );
        this.doConvertComics(
          [this.currentComic],
          archiveTypeFromString(archiveTypeString)
        );
      }
    });
  }

  onConvertSelected(archiveTypeString: string): void {
    const selectedComics = this.dataSource.data
      .filter(entry => entry.selected)
      .map(entry => entry.item);

    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.convert-comics.convert-selected.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.convert-comics.convert-selected.confirmation-message',
        { count: selectedComics.length, format: archiveTypeString }
      ),
      confirm: () => {
        this.logger.debug(
          'Converting comics:',
          selectedComics,
          archiveTypeString
        );
        this.doConvertComics(
          selectedComics,
          archiveTypeFromString(archiveTypeString)
        );
      }
    });
  }

  onAddOneToReadingList(list: ReadingList): void {
    this.doAddToReadingList([this.currentComic], list);
  }

  onAddSelectedToReadingList(list: ReadingList): void {
    this.doAddToReadingList(
      this.dataSource.data
        .filter(entry => entry.selected)
        .map(entry => entry.item),
      list
    );
  }

  onMarkOneAsRead(read: boolean): void {
    this.doMarkAsRead([this.currentComic], read);
  }

  onMarkSelectedAsRead(read: boolean): void {
    this.doMarkAsRead(this.getSelectedComics(), read);
  }

  onMarkSelectedAsDeleted(deleted: boolean): void {
    this.doMarkAsDeleted(this.getSelectedComics(), deleted);
  }

  isDeleted(comicDetail: ComicDetail): boolean {
    return comicDetail?.comicState === ComicBookState.DELETED;
  }

  onMarkOneAsDeleted(deleted: boolean): void {
    this.doMarkAsDeleted([this.currentComic], deleted);
  }

  onEditMultipleComics(): void {
    this.logger.debug('Editing multiple comics:', this.selectedIds);
    const selections = this.dataSource.data
      .filter(entry => entry.selected)
      .map(entry => entry.item);
    const dialog = this.dialog.open(EditMultipleComicsComponent, {
      data: selections
    });
    dialog.afterClosed().subscribe((response: EditMultipleComics) => {
      if (!!response) {
        const count = selections.length;
        this.confirmationService.confirm({
          title: this.translateService.instant(
            'library.edit-multiple-comics.confirm-title',
            { count }
          ),
          message: this.translateService.instant(
            'library.edit-multiple-comics.confirm-message',
            { count }
          ),
          confirm: () => {
            this.logger.trace('Editing multiple comics');
            this.store.dispatch(
              editMultipleComics({ comicBooks: selections, details: response })
            );
          }
        });
      }
    });
  }

  private doMarkAsDeleted(comicBooks: ComicDetail[], deleted: boolean): void {
    this.logger.debug('Marking comics as deleted:', comicBooks, deleted);
    this.store.dispatch(markComicsDeleted({ comicBooks, deleted }));
  }

  private doAddToReadingList(
    comicBooks: ComicDetail[],
    list: ReadingList
  ): void {
    this.logger.debug('Adding comics to reading list:', comicBooks, list);
    this.store.dispatch(addComicsToReadingList({ comicBooks, list }));
  }

  private doMarkAsRead(comicBooks: ComicDetail[], read: boolean): void {
    this.logger.debug('Setting comics read:', comicBooks, read);
    this.store.dispatch(setComicBooksRead({ comicBooks, read }));
  }

  private doConvertComics(
    comicBooks: ComicDetail[],
    archiveType: ArchiveType
  ): void {
    this.store.dispatch(
      convertComics({
        comicBooks,
        archiveType,
        deletePages: true,
        renamePages: true
      })
    );
  }

  private getSelectedComics(): ComicDetail[] {
    return this.dataSource.data
      .filter(entry => entry.selected)
      .map(entry => entry.item);
  }
}
