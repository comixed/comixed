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
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
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
  MatRow,
  MatNoDataRow
} from '@angular/material/table';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { Store } from '@ngrx/store';
import { ComicState } from '@app/comic-books/models/comic-state';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReadingList } from '@app/lists/models/reading-list';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  convertSelectedComicBooks,
  convertSingleComicBook
} from '@app/library/actions/convert-comic-books.actions';
import { addSelectedComicBooksToReadingList } from '@app/lists/actions/reading-list-entries.actions';
import {
  deleteSelectedComicBooks,
  deleteSingleComicBook,
  undeleteSelectedComicBooks,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import { editMultipleComics } from '@app/library/actions/library.actions';
import { EditMultipleComicsComponent } from '@app/library/components/edit-multiple-comics/edit-multiple-comics.component';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import {
  updateSelectedComicBooksMetadata,
  updateSingleComicBookMetadata
} from '@app/library/actions/update-metadata.actions';
import {
  startEntireLibraryOrganization,
  startLibraryOrganization
} from '@app/library/actions/organize-library.actions';
import {
  rescanSelectedComicBooks,
  rescanSingleComicBook
} from '@app/library/actions/rescan-comics.actions';
import {
  addSingleComicBookSelection,
  removeSingleComicBookSelection
} from '@app/comic-books/actions/comic-book-selection.actions';
import { archiveTypeFromString } from '@app/comic-books/comic-books.functions';
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';
import { selectLibraryPluginList } from '@app/library-plugins/selectors/library-plugin.selectors';
import { loadLibraryPlugins } from '@app/library-plugins/actions/library-plugin.actions';
import {
  runLibraryPluginOnOneComicBook,
  runLibraryPluginOnSelectedComicBooks
} from '@app/library-plugins/actions/run-library-plugin.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PREFERENCE_PAGE_SIZE } from '@app/comic-files/comic-file.constants';
import { selectComicBookSelectionState } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { ComicBookSelectionState } from '@app/comic-books/reducers/comic-book-selection.reducer';
import {
  markSelectedComicBooksRead,
  markSingleComicBookRead
} from '@app/user/actions/read-comic-books.actions';
import { batchScrapeComicBooks } from '@app/comic-metadata/actions/multi-book-scraping.actions';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { loadReadingLists } from '@app/lists/actions/reading-lists.actions';
import {
  MatCard,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent
} from '@angular/material/card';
import { ComicListFilterComponent } from '../comic-list-filter/comic-list-filter.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatLabel } from '@angular/material/form-field';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';

@Component({
  selector: 'cx-comic-list-view',
  templateUrl: './comic-list-view.component.html',
  styleUrls: ['./comic-list-view.component.scss'],
  imports: [
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    ComicListFilterComponent,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatIcon,
    MatTooltip,
    MatCellDef,
    MatCell,
    MatMenuTrigger,
    MatCheckbox,
    MatSortHeader,
    RouterLink,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    MatMenu,
    MatMenuItem,
    MatLabel,
    AsyncPipe,
    DatePipe,
    TranslateModule,
    ComicCoverUrlPipe,
    ComicTitlePipe
  ]
})
export class ComicListViewComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Output() selectAll = new EventEmitter<boolean>();
  @Output() filtered = new EventEmitter<boolean>();
  @Output() showing = new EventEmitter<number>();

  @Input() isAdmin = false;
  @Input() readingLists: ReadingList[] = [];
  @Input() unreadOnly = false;
  @Input() showFilter = true;
  @Input() extraFieldTitle = '';
  @Input() followClick = true;
  @Input() usePopups = true;
  @Input() showAction = true;
  @Input() showSelection = true;
  @Input() showThumbnail = true;
  @Input() showArchiveType = true;
  @Input() showComicState = true;
  @Input() showComicType = true;
  @Input() showPublisher = true;
  @Input() showSeries = true;
  @Input() showVolume = true;
  @Input() showIssueNumber = true;
  @Input() showCoverDate = true;
  @Input() showStoreDate = true;
  @Input() showPageCount = false;
  @Input() showLastReadDate = false;
  @Input() showAddedDate = true;
  @Input() totalComics = 0;
  @Input() coverYears: number[] = [];
  @Input() coverMonths: number[] = [];

  selectionStateSubscription: Subscription;
  selectionState: ComicBookSelectionState;
  showComicDetailPopup = false;
  showComicFilterPopup = false;
  selectedComic: DisplayableComic;
  dataSource = new MatTableDataSource<SelectableListItem<DisplayableComic>>();
  queryParamsSubscription: Subscription;
  libraryPluginListSubscription: Subscription;
  libraryPluginlist: LibraryPlugin[] = [];

  logger = inject(LoggerService);
  store = inject(Store);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  dialog = inject(MatDialog);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.logger.trace('Subscribing to query parameter updates');
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      () => this.applyFilters()
    );
    this.logger.trace('Subscribing to selection state updates');
    this.selectionStateSubscription = this.store
      .select(selectComicBookSelectionState)
      .subscribe(state => (this.selectionState = state));
    this.logger.trace('Subscribing to library plugin list updates');
    this.libraryPluginListSubscription = this.store
      .select(selectLibraryPluginList)
      .subscribe(list => (this.libraryPluginlist = list));
  }

  private _comicBooksRead: number[] = [];

  get comicBooksRead(): number[] {
    return this._comicBooksRead;
  }

  @Input() set comicBooksRead(comicBooksRead: number[]) {
    this.logger.debug('Setting comic books read:', comicBooksRead);
    this._comicBooksRead = comicBooksRead;
    this.applyFilters();
  }

  get displayedColumns(): string[] {
    return [
      this.showAction ? 'action' : null,
      this.showSelection ? 'selection' : null,
      this.showThumbnail ? 'thumbnail' : null,
      this.showArchiveType ? 'archive-type' : null,
      this.showComicState ? 'comic-state' : null,
      this.showComicType ? 'comic-type' : null,
      this.showPublisher ? 'publisher' : null,
      this.showSeries ? 'series' : null,
      this.showVolume ? 'volume' : null,
      this.showIssueNumber ? 'issue-number' : null,
      this.showPageCount ? 'page-count' : null,
      this.showCoverDate ? 'cover-date' : null,
      this.showStoreDate ? 'store-date' : null,
      this.showAddedDate ? 'added-date' : null
    ].filter(entry => !!entry);
  }

  private _selectedIds: number[] = [];

  get selectedIds(): number[] {
    return this._selectedIds;
  }

  @Input() set selectedIds(selectedIds: number[]) {
    this._selectedIds = selectedIds;
    this.applyFilters();
  }

  private _comics: DisplayableComic[] = [];

  get comics(): DisplayableComic[] {
    return this._comics;
  }

  @Input() set comics(comics: DisplayableComic[]) {
    this._comics = comics;
    this.applyFilters();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Loading reading lists');
    this.store.dispatch(loadReadingLists());
  }

  ngOnInit(): void {
    this.logger.trace('Loading library plugin list');
    this.store.dispatch(loadLibraryPlugins());
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsbuscribing from query param updates');
    this.queryParamsSubscription.unsubscribe();
    this.logger.trace('Unsbuscribing from selection state updates');
    this.selectionStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from library plugin list updates');
    this.libraryPluginListSubscription.unsubscribe();
  }

  getIconForState(comicState: ComicState): string {
    switch (comicState) {
      case ComicState.ADDED:
        return 'add';
      case ComicState.UNPROCESSED:
        return 'bolt';
      case ComicState.STABLE:
        return 'check_circle';
      case ComicState.CHANGED:
        return 'change_circle';
      case ComicState.DELETED:
        return 'delete';
    }
  }

  @HostListener('window:keydown.control.a', ['$event']) onHotkeySelectAll(
    event: KeyboardEvent
  ): void {
    this.logger.trace('Select all hotkey pressed');
    event.preventDefault();
    this.selectAll.emit(true);
  }

  @HostListener('window:keydown.control.shift.a', ['$event'])
  onHotkeyDeselectAll(event: KeyboardEvent): void {
    this.logger.trace('Deselect all hotkey pressed');
    event.preventDefault();
    this.selectAll.emit(false);
  }

  onSetSelectedState(
    entry: SelectableListItem<DisplayableComic>,
    selected: boolean
  ): void {
    if (selected) {
      this.logger.debug('Adding comic book selection:', entry.item);
      this.store.dispatch(
        addSingleComicBookSelection({ comicBookId: entry.item.comicBookId })
      );
    } else {
      this.logger.debug('Removing comic book selection:', entry.item);
      this.store.dispatch(
        removeSingleComicBookSelection({ comicBookId: entry.item.comicBookId })
      );
    }
  }

  onShowPopup(show: boolean, comic: DisplayableComic): void {
    this.logger.debug('Setting show popup:', show, this.usePopups);
    this.showComicDetailPopup = show && this.usePopups;
    this.selectedComic = comic;
  }

  isRead(comic: DisplayableComic): boolean {
    return !!comic && this.comicBooksRead.includes(comic.comicDetailId);
  }

  onConvertSingleComicBook(archiveTypeString: string): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.convert-single-comic-book.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.convert-single-comic-book.confirmation-message',
        { format: archiveTypeString }
      ),
      confirm: () => {
        this.logger.debug(
          'Converting comic:',
          this.selectedComic,
          archiveTypeString
        );
        this.store.dispatch(
          convertSingleComicBook({
            id: this.selectedComic.comicBookId,
            archiveType: archiveTypeFromString(archiveTypeString),
            deletePages: true,
            renamePages: true
          })
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
        'library.convert-selected-comic-books.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.convert-selected-comic-books.confirmation-message',
        {
          count: selectedComics.length,
          format: archiveTypeString
        }
      ),
      confirm: () => {
        this.logger.debug(
          'Converting comics:',
          selectedComics,
          archiveTypeString
        );
        this.store.dispatch(
          convertSelectedComicBooks({
            archiveType: archiveTypeFromString(archiveTypeString),
            deletePages: true,
            renamePages: true
          })
        );
      }
    });
  }

  onAddOneToReadingList(list: ReadingList): void {
    this.logger.debug('Adding selected comic books to reading list:', list);
    this.store.dispatch(addSelectedComicBooksToReadingList({ list }));
  }

  onAddSelectedToReadingList(list: ReadingList): void {
    this.logger.debug('Adding comics to reading list:', list);
    this.store.dispatch(addSelectedComicBooksToReadingList({ list }));
  }

  onMarkOneAsRead(read: boolean): void {
    this.store.dispatch(
      markSingleComicBookRead({
        comicBookId: this.selectedComic.comicBookId,
        read
      })
    );
  }

  onMarkSelectedAsRead(read: boolean): void {
    this.store.dispatch(markSelectedComicBooksRead({ read }));
  }

  onMarkSelectedAsDeleted(deleted: boolean): void {
    if (deleted) {
      this.store.dispatch(deleteSelectedComicBooks());
    } else {
      this.store.dispatch(undeleteSelectedComicBooks());
    }
  }

  isDeleted(comic: DisplayableComic): boolean {
    return comic?.comicState === ComicState.DELETED;
  }

  onMarkOneAsDeleted(deleted: boolean): void {
    if (deleted) {
      this.store.dispatch(
        deleteSingleComicBook({ comicBookId: this.selectedComic.comicBookId })
      );
    } else {
      this.store.dispatch(
        undeleteSingleComicBook({
          comicBookId: this.selectedComic.comicBookId
        })
      );
    }
  }

  onEditMultipleComics(): void {
    this.logger.debug('Editing multiple comics:', this.selectedIds);
    const dialog = this.dialog.open(EditMultipleComicsComponent, {
      data: this.selectedIds
    });
    dialog.afterClosed().subscribe((response: EditMultipleComics) => {
      this.logger.debug('Edit multiple comics response:', response);
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
            this.logger.debug('Editing multiple comics');
            this.store.dispatch(
              editMultipleComics({ ids: this.selectedIds, details: response })
            );
          }
        });
      }
    });
  }

  onOrganizeSelectedComicBooks() {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.organization.confirmation-title',
        { count: this.selectedIds.length }
      ),
      message: this.translateService.instant(
        'library.organization.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Organizing the library');
        this.store.dispatch(startLibraryOrganization());
      }
    });
  }

  onFilterComics(): void {
    this.logger.debug('Showing comic detail filters');
    this.showComicFilterPopup = true;
  }

  onUpdateSingleComicBookMetadata(comic: DisplayableComic): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: 1 }
      ),
      confirm: () => {
        this.logger.debug('Updating metadata for a single comic book:', comic);
        this.store.dispatch(
          updateSingleComicBookMetadata({ comicBookId: comic.comicBookId })
        );
      }
    });
  }

  onUpdateSelectedComicBooksMetadata(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.debug('Updating metadata for selected comic books');
        this.store.dispatch(updateSelectedComicBooksMetadata());
      }
    });
  }

  onScrapeComics(ids: number[]): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.scrape-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.scrape-comics.confirmation-message',
        { count: ids.length }
      ),
      confirm: () => {
        this.logger.debug('Scraping comics:', ids);
        this.router.navigateByUrl('/metadata/scraping/issues');
      }
    });
  }

  onBatchScrapeComics(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.batch-scrape-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.batch-scrape-comics.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Starting batch scraping comics');
        this.store.dispatch(batchScrapeComicBooks());
      }
    });
  }

  onRescanSingleComicBook(comic: DisplayableComic): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.rescan-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.rescan-comics.confirmation-message',
        { count: 1 }
      ),
      confirm: () => {
        this.logger.debug('Rescanning a single comic book:', comic);
        this.store.dispatch(
          rescanSingleComicBook({ comicBookId: comic.comicBookId })
        );
      }
    });
  }

  onRescanSelectedComicBooks(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.rescan-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.rescan-comics.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.debug('Rescanning selected comic books');
        this.store.dispatch(rescanSelectedComicBooks());
      }
    });
  }

  onRunLibraryPluginSingleOnComicBook(
    plugin: LibraryPlugin,
    comic: DisplayableComic
  ): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.run-library-plugin.confirmation-title',
        { name: plugin.name, version: plugin.version }
      ),
      message: this.translateService.instant(
        'library.run-library-plugin.confirmation-message',
        { count: 1 }
      ),
      confirm: () => {
        this.logger.debug(
          'Running plugin on current comic book:',
          plugin,
          comic.comicBookId
        );
        this.store.dispatch(
          runLibraryPluginOnOneComicBook({
            plugin,
            comicBookId: comic.comicBookId
          })
        );
      }
    });
  }

  onRunLibraryPluginOnSelectedComicBooks(plugin: LibraryPlugin): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.run-library-plugin.confirmation-title',
        { name: plugin.name, version: plugin.version }
      ),
      message: this.translateService.instant(
        'library.run-library-plugin.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.debug('Running plugin on selected comic books:', plugin);
        this.store.dispatch(
          runLibraryPluginOnSelectedComicBooks({
            plugin
          })
        );
      }
    });
  }

  onOrganizeEntireLibrary(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.organization-everything.confirmation-title',
        { count: this.selectedIds.length }
      ),
      message: this.translateService.instant(
        'library.organization-everything.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Organizing the entire library');
        this.store.dispatch(startEntireLibraryOrganization());
      }
    });
  }

  onPageChange(pageSize: number): void {
    this.logger.debug('Setting user preference comic page size:', pageSize);
    this.store.dispatch(
      saveUserPreference({ name: PREFERENCE_PAGE_SIZE, value: `${pageSize}` })
    );
  }

  private applyFilters(): void {
    this.logger.trace('Setting data source');
    const filtered =
      !!this.queryParameterService.coverYear$?.value?.year ||
      !!this.queryParameterService.coverYear$?.value?.month ||
      !!this.queryParameterService.archiveType$?.value ||
      !!this.queryParameterService.comicType$?.value ||
      this.queryParameterService.filterText$.value?.length > 0;
    this.logger.debug('Filtered flag:', filtered);
    this.filtered.emit(filtered);
    this.dataSource.data = this.comics.map(comic => {
      return {
        item: comic,
        selected: this.selectedIds.includes(comic.comicBookId)
      };
    });
    this.showing.emit(this.dataSource.filteredData.length);
  }
}
