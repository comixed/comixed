/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { editMultipleComics } from '@app/library/actions/library.actions';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ComicDetailsDialogComponent } from '@app/library/components/comic-details-dialog/comic-details-dialog.component';
import { PAGE_SIZE_DEFAULT } from '@app/library/library.constants';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { TranslateService } from '@ngx-translate/core';
import { updateMetadata } from '@app/library/actions/update-metadata.actions';
import {
  ArchiveType,
  archiveTypeFromString
} from '@app/comic-books/models/archive-type.enum';
import { markComicsDeleted } from '@app/comic-books/actions/mark-comics-deleted.actions';
import { ReadingList } from '@app/lists/models/reading-list';
import { addComicsToReadingList } from '@app/lists/actions/reading-list-entries.actions';
import { convertComics } from '@app/library/actions/convert-comics.actions';
import { setComicBooksRead } from '@app/last-read/actions/set-comics-read.actions';
import { LastRead } from '@app/last-read/models/last-read';
import { MatSort } from '@angular/material/sort';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { FileDownloadService } from '@app/core/services/file-download.service';
import { EditMultipleComicsComponent } from '@app/library/components/edit-multiple-comics/edit-multiple-comics.component';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import {
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';
import * as _ from 'lodash';

@Component({
  selector: 'cx-comic-book-covers',
  templateUrl: './comic-book-covers.component.html',
  styleUrls: ['./comic-book-covers.component.scss']
})
export class ComicBookCoversComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(LibraryToolbarComponent) toolbar: LibraryToolbarComponent;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  @ViewChild(MatSort) sort: MatSort;

  @Input() title = '';
  @Input() showToolbar = true;
  @Input() selectedIds: number[] = [];
  @Input() readingLists: ReadingList[] = [];
  @Input() isAdmin = false;
  @Input() pageSize = PAGE_SIZE_DEFAULT;
  @Input() showUpdateMetadata = false;
  @Input() showConsolidate = false;
  @Input() showPurge = false;
  @Input() archiveType: ArchiveType;
  @Input() showActions = true;
  @Input() showCoverFilters = true;
  @Input() coverDateFilter: CoverDateFilter = { year: null, month: null };
  @Input() showCovers = true;

  @Output() pageIndexChanged = new EventEmitter<number>();
  @Output() selectAllComics = new EventEmitter<boolean>();

  pagination = PAGE_SIZE_DEFAULT;
  dataSource = new MatTableDataSource<ComicBook>([]);
  comic: ComicBook = null;
  contextMenuX = '';
  contextMenuY = '';
  private _comicBooksObservable = new BehaviorSubject<ComicBook[]>([]);

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fileDownloadService: FileDownloadService
  ) {}

  private _pageIndex = 0;
  get pageIndex(): number {
    return this._pageIndex;
  }

  @Input() set pageIndex(pageIndex: number) {
    this._pageIndex = pageIndex;
    /* istanbul ignore next */
    if (!!this.dataSource.paginator) {
      this.dataSource.paginator.pageIndex = this._pageIndex;
    }
  }

  private _sortField: string;

  get sortField(): string {
    return this._sortField;
  }

  @Input() set sortField(sortField: string) {
    this._sortField = sortField;
    this.sortData();
  }

  private _readComicIds: number[] = [];

  get readComicIds(): number[] {
    return this._readComicIds;
  }

  get comicBooks(): ComicBook[] {
    return this._comicBooksObservable.getValue();
  }

  @Input() set comicBooks(comicBooks: ComicBook[]) {
    this.logger.trace('Setting comics:', comicBooks);
    this.dataSource.data = _.cloneDeep(comicBooks);
    this.pageIndex = this._pageIndex;
    this.sortData();
  }

  @Input() set lastRead(lastRead: LastRead[]) {
    this._readComicIds = lastRead.map(entry => entry.comicBook.id);
  }

  get selectedComicBooks(): ComicBook[] {
    return this.comicBooks.filter(comicBook =>
      this.selectedIds.includes(comicBook.id)
    );
  }

  ngOnInit(): void {
    this._comicBooksObservable = this.dataSource.connect();
  }

  ngOnDestroy(): void {
    this.dataSource.disconnect();
  }

  isSelected(comicBook: ComicBook): boolean {
    return this.selectedIds.includes(comicBook.id);
  }

  onSelectionChanged(comicBook: ComicBook, selected: boolean): void {
    if (selected) {
      this.logger.trace('Marking comic as selected:', comicBook);
      this.store.dispatch(selectComicBooks({ ids: [comicBook.id] }));
    } else {
      this.logger.trace('Unmarking comic as selected:', comicBook);
      this.store.dispatch(deselectComicBooks({ ids: [comicBook.id] }));
    }
  }

  onShowContextMenu(comic: ComicBook, x: string, y: string): void {
    this.logger.trace('Popping up context menu for:', comic);
    this.comic = comic;
    this.contextMenuX = x;
    this.contextMenuY = y;
    this.contextMenu.openMenu();
  }

  onShowComicDetails(comic: ComicBook): void {
    this.logger.trace('Showing comic details:', comic);
    this.dialog.open(ComicDetailsDialogComponent, { data: comic });
  }

  onMarkOneComicRead(comic: ComicBook, read: boolean): void {
    this.logger.trace('Setting one comic read state:', comic, read);
    this.store.dispatch(setComicBooksRead({ comicBooks: [comic], read }));
  }

  onMarkMultipleComicsRead(read: boolean): void {
    this.logger.trace('Setting selected comics read state:', read);
    this.store.dispatch(
      setComicBooksRead({ comicBooks: this.selectedComicBooks, read })
    );
  }

  ngAfterViewInit(): void {
    /* istanbul ignore next */
    if (this.showToolbar) {
      this.logger.trace('Setting up pagination');
      this.dataSource.paginator = this.toolbar.paginator;
    }
  }

  isChanged(comic: ComicBook): boolean {
    return comic.comicState === ComicBookState.CHANGED;
  }

  onUpdateMetadata(comic: ComicBook): void {
    this.logger.trace('Confirming updating ComicInfo.xml');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: 1 }
      ),
      confirm: () => {
        this.logger.trace('Updating comic info:', comic);
        this.store.dispatch(updateMetadata({ ids: [comic.id] }));
      }
    });
  }

  onMarkAsDeleted(comic: ComicBook, deleted: boolean): void {
    this.logger.trace('Confirming deleted state with user:', comic, deleted);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.mark-as-deleted.confirmation-title',
        {
          deleted
        }
      ),
      message: this.translateService.instant(
        'comic-book.mark-as-deleted.confirmation-message',
        { deleted }
      ),
      confirm: () => {
        this.logger.trace('Firing deleted state change:', comic, deleted);
        this.store.dispatch(
          markComicsDeleted({ comicBooks: [comic], deleted })
        );
      }
    });
  }

  onMarkSelectedDeleted(deleted: boolean): void {
    this.logger.trace(
      'Confirming selected comics deleted state with user:',
      deleted
    );
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.mark-selected-as-deleted.confirmation-title',
        {
          deleted
        }
      ),
      message: this.translateService.instant(
        'library.mark-selected-as-deleted.confirmation-message',
        { deleted }
      ),
      confirm: () => {
        this.logger.trace('Firing selected comics  state change:', deleted);
        this.store.dispatch(
          markComicsDeleted({ comicBooks: this.selectedComicBooks, deleted })
        );
      }
    });
  }

  addSelectedToReadingList(list: ReadingList): void {
    this.logger.trace('Confirming adding comics to reading list:', list);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.add-to-reading-list.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.add-to-reading-list.confirmation-message',
        { count: this.selectedIds.length, name: list.name }
      ),
      confirm: () => {
        this.logger.trace('Firing action: add comics to reading list');
        this.store.dispatch(
          addComicsToReadingList({ list, comicBooks: this.selectedComicBooks })
        );
      }
    });
  }

  onConvertOne(comicBook: ComicBook, format: string): void {
    this.doConversion(
      this.translateService.instant(
        'library.convert-comics.convert-one.confirmation-title'
      ),
      this.translateService.instant(
        'library.convert-comics.convert-one.confirmation-message',
        { format }
      ),
      format,
      [comicBook]
    );
  }

  onConvertSelected(format: string): void {
    this.doConversion(
      this.translateService.instant(
        'library.convert-comics.convert-selected.confirmation-title'
      ),
      this.translateService.instant(
        'library.convert-comics.convert-selected.confirmation-message',
        { format, count: this.selectedIds.length }
      ),
      format,
      this.selectedComicBooks
    );
  }

  isRead(comic: ComicBook): boolean {
    return this.readComicIds.includes(comic.id);
  }

  downloadComicData(comics: ComicBook[]): void {
    this.logger.debug('Downloading comic metadata:', comics);
    this.fileDownloadService.saveFileContent({
      content: new Blob([JSON.stringify(comics)], { type: 'application/json' }),
      filename: 'debug-metadata.json'
    });
  }

  isDeleted(comic: ComicBook): boolean {
    return comic.comicState === ComicBookState.DELETED;
  }

  sortData(): void {
    this.dataSource.data = this.dataSource.data.sort((left, right) => {
      switch (this.sortField) {
        case 'added-date':
          return left.addedDate - right.addedDate;
        case 'cover-date':
          return left.coverDate - right.coverDate;
        case 'issue-number':
          return left.sortableIssueNumber == right.sortableIssueNumber
            ? 0
            : left.sortableIssueNumber > right.sortableIssueNumber
            ? 1
            : -1;
      }
    });
  }

  doConversion(
    title: string,
    message: string,
    format: string,
    comics: ComicBook[]
  ): void {
    const archiveType = archiveTypeFromString(format);
    this.logger.trace('Confirming conversion with user');
    this.confirmationService.confirm({
      title,
      message,
      confirm: () => {
        this.logger.trace('Firing action to convert comics');
        this.store.dispatch(
          convertComics({
            comicBooks: comics,
            archiveType,
            deletePages: true,
            renamePages: true
          })
        );
      }
    });
  }

  onEditMultipleComics(): void {
    this.logger.trace('Editing details for multiple comics');
    const dialog = this.dialog.open(EditMultipleComicsComponent, {
      data: this.selectedIds
    });
    dialog.afterClosed().subscribe((response: EditMultipleComics) => {
      if (!!response) {
        const count = this.selectedIds.length;
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
              editMultipleComics({
                comicBooks: this.selectedComicBooks,
                details: response
              })
            );
          }
        });
      }
    });
  }
}
