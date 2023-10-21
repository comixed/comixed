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
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { Store } from '@ngrx/store';
import { ComicState } from '@app/comic-books/models/comic-state';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { ActivatedRoute, Router } from '@angular/router';
import { LastRead } from '@app/last-read/models/last-read';
import { ReadingList } from '@app/lists/models/reading-list';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { convertComics } from '@app/library/actions/convert-comics.actions';
import { archiveTypeFromString } from '@app/comic-books/comic-books.functions';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { addComicsToReadingList } from '@app/lists/actions/reading-list-entries.actions';
import { setComicBooksRead } from '@app/last-read/actions/set-comics-read.actions';
import { markComicsDeleted } from '@app/comic-books/actions/mark-comics-deleted.actions';
import { editMultipleComics } from '@app/library/actions/library.actions';
import { EditMultipleComicsComponent } from '@app/library/components/edit-multiple-comics/edit-multiple-comics.component';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { updateMetadata } from '@app/library/actions/update-metadata.actions';
import { startLibraryConsolidation } from '@app/library/actions/consolidate-library.actions';
import { rescanComics } from '@app/library/actions/rescan-comics.actions';
import {
  addSingleComicBookSelection,
  removeSingleComicBookSelection
} from '@app/comic-books/actions/comic-book-selection.actions';

@Component({
  selector: 'cx-comic-detail-list-view',
  templateUrl: './comic-detail-list-view.component.html',
  styleUrls: ['./comic-detail-list-view.component.scss']
})
export class ComicDetailListViewComponent implements OnDestroy {
  @Output() selectAll = new EventEmitter<boolean>();
  @Output() filtered = new EventEmitter<boolean>();
  @Output() showing = new EventEmitter<number>();

  @Input() isAdmin = false;
  @Input() readingLists: ReadingList[] = [];
  @Input() unreadOnly = false;
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
  @Input() showLastReadDate = false;
  @Input() showAddedDate = true;
  @Input() totalComics = 0;
  @Input() coverYears: number[] = [];
  @Input() coverMonths: number[] = [];

  showComicDetailPopup = false;
  showComicFilterPopup = false;
  currentComic: ComicDetail;
  dataSource = new MatTableDataSource<SelectableListItem<ComicDetail>>();
  queryParamsSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    public queryParameterService: QueryParameterService
  ) {
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      () => this.applyFilters()
    );
  }

  private _lastReadDates: LastRead[] = [];

  get lastReadDates(): LastRead[] {
    return this._lastReadDates;
  }

  @Input() set lastReadDates(lastReadDates: LastRead[]) {
    this._lastReadDates = lastReadDates;
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
    this.applyFilters();
  }

  private _comics: ComicDetail[] = [];

  get comics(): ComicDetail[] {
    return this._comics;
  }

  @Input() set comics(comics: ComicDetail[]) {
    this._comics = comics;
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsbuscribing from query param updates');
    this.queryParamsSubscription.unsubscribe();
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
    this.logger.debug('Select all hotkey pressed');
    event.preventDefault();
    this.selectAll.emit(true);
  }

  @HostListener('window:keydown.control.shift.a', ['$event'])
  onHotkeyDeselectAll(event: KeyboardEvent): void {
    this.logger.debug('Deselect all hotkey pressed');
    event.preventDefault();
    this.selectAll.emit(false);
  }

  onSetSelectedState(
    entry: SelectableListItem<ComicDetail>,
    selected: boolean
  ): void {
    if (selected) {
      this.logger.debug('Adding comic book selection:', entry.item);
      this.store.dispatch(
        addSingleComicBookSelection({ comicBookId: entry.item.comicId })
      );
    } else {
      this.logger.debug('Removing comic book selection:', entry.item);
      this.store.dispatch(
        removeSingleComicBookSelection({ comicBookId: entry.item.comicId })
      );
    }
  }

  onRowSelected(row: SelectableListItem<ComicDetail>): void {
    if (this.followClick) {
      this.router.navigate(['/comics', row.item.comicId]);
    }
  }

  onShowPopup(show: boolean, comic: ComicDetail): void {
    this.logger.debug('Setting show pup:', show, this.usePopups);
    this.showComicDetailPopup = show && this.usePopups;
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
    return comicDetail?.comicState === ComicState.DELETED;
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
      this.logger.debug('Edit multiple comics response:', response);
      console.log('Edit multiple comics response:', response);
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
            this.logger.debug('Editing multiple comics');
            this.store.dispatch(
              editMultipleComics({ comicBooks: selections, details: response })
            );
          }
        });
      }
    });
  }

  onConsolidateComics(ids: number[]) {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.consolidate.confirmation-title',
        { count: this.selectedIds.length }
      ),
      message: this.translateService.instant(
        'library.consolidate.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Consolidating the library');
        this.store.dispatch(startLibraryConsolidation({ ids }));
      }
    });
  }

  onFilterComics(): void {
    this.logger.debug('Showing comic detail filters');
    this.showComicFilterPopup = true;
  }

  onUpdateMetadata(ids: number[]): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: ids.length }
      ),
      confirm: () => {
        this.logger.debug('Updating metadata for comics:', ids);
        this.store.dispatch(updateMetadata({ ids }));
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
        this.router.navigateByUrl('/library/scrape');
      }
    });
  }

  onRescanComics(selectedIds: number[]): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.rescan-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.rescan-comics.confirmation-message',
        { count: selectedIds.length }
      ),
      confirm: () => {
        this.logger.debug('Rescanning comics:', selectedIds);
        this.store.dispatch(rescanComics({ ids: selectedIds }));
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

  private applyFilters(): void {
    this.logger.debug('Setting data source');
    const filtered =
      !!this.queryParameterService.coverYear$?.value?.year ||
      !!this.queryParameterService.coverYear$?.value?.month ||
      !!this.queryParameterService.archiveType$?.value ||
      !!this.queryParameterService.comicType$?.value ||
      this.queryParameterService.filterText$.value?.length > 0;
    this.logger.debug('Filtered flag:', filtered);
    this.filtered.emit(filtered);
    this.dataSource.data = this.comics.map(comic => {
      this.logger.debug(
        `Comic id: ${comic.comicId} selected: ${this.selectedIds.includes(
          comic.comicId
        )}`
      );
      return {
        item: comic,
        selected: this.selectedIds.includes(comic.comicId)
      };
    });
    this.showing.emit(this.dataSource.filteredData.length);
  }
}
