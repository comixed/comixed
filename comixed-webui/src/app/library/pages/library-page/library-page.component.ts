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
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import {
  getPageSize,
  getUserPreference,
  isAdmin
} from '@app/user/user.functions';
import { ActivatedRoute, Router } from '@angular/router';
import { selectComicBookListState } from '@app/comic-books/selectors/comic-book-list.selectors';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { LastRead } from '@app/last-read/models/last-read';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { selectLibrarySelections } from '@app/library/selectors/library-selections.selectors';
import {
  clearSelectedComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_DEFAULT } from '@app/core';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ListItem } from '@app/core/models/ui/list-item';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { updateMetadata } from '@app/library/actions/update-metadata.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { startLibraryConsolidation } from '@app/library/actions/consolidate-library.actions';
import { purgeLibrary } from '@app/library/actions/purge-library.actions';
import { rescanComics } from '@app/library/actions/rescan-comics.actions';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';

@Component({
  selector: 'cx-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.scss']
})
export class LibraryPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<SelectableListItem<ComicDetail>>([]);

  showActions = true;
  showComicFilters = true;

  queryParamsSubscription: Subscription;

  comicBookListStateSubscription: Subscription;
  selectedSubscription: Subscription;
  selectedIds: number[] = [];
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  isAdmin = false;
  pageSize = PAGE_SIZE_DEFAULT;
  showUpdateMetadata = false;
  showConsolidate = false;
  showPurge = false;
  dataSubscription: Subscription;
  unreadOnly = false;
  unreadSwitch = false;
  unscrapedOnly = false;
  changedOnly = false;
  deletedOnly = false;
  unprocessedOnly = false;
  lastReadDatesSubscription: Subscription;
  lastReadDates: LastRead[] = [];
  readingListsSubscription: Subscription;
  readingLists: ReadingList[] = [];
  pageContent = 'comics';
  showCovers = true;
  coverYears: ListItem<number>[] = [];
  coverMonths: ListItem<number>[] = [];
  readonly archiveTypeOptions: SelectionOption<ArchiveType>[] = [
    { label: 'archive-type.label.all', value: null },
    { label: 'archive-type.label.cbz', value: ArchiveType.CBZ },
    { label: 'archive-type.label.cbr', value: ArchiveType.CBR },
    { label: 'archive-type.label.cb7', value: ArchiveType.CB7 }
  ];
  private _comicDetails: ComicDetail[] = [];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public queryParameterService: QueryParameterService
  ) {
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      params => this.loadDataSource()
    );
    this.dataSubscription = this.activatedRoute.data.subscribe(data => {
      this.unreadOnly = !!data.unread && data.unread === true;
      this.unscrapedOnly = !!data.unscraped && data.unscraped === true;
      this.changedOnly = !!data.changed && data.changed === true;
      this.deletedOnly = !!data.deleted && data.deleted === true;
      this.unprocessedOnly = !!data.unprocessed && data.unprocessed === true;
      this.showUpdateMetadata = !this.unprocessedOnly && !this.deletedOnly;
      this.showConsolidate =
        !this.unreadOnly && !this.unscrapedOnly && !this.deletedOnly;
      this.showPurge = this.deletedOnly;
      this.pageContent = 'all';
      if (this.unreadOnly) {
        this.pageContent = 'unread-only';
      }
      if (this.unscrapedOnly) {
        this.pageContent = 'unscraped-only';
      }
      if (this.changedOnly) {
        this.pageContent = 'changed-only';
      }
      if (this.deletedOnly) {
        this.pageContent = 'deleted-only';
      }
      if (this.unprocessedOnly) {
        this.pageContent = 'unprocessed-only';
      }
    });
    this.comicBookListStateSubscription = this.store
      .select(selectComicBookListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
        if (this.unscrapedOnly) {
          this.comicBooks = state.unscraped;
        } else if (this.changedOnly) {
          this.comicBooks = state.changed;
        } else if (this.deletedOnly) {
          this.comicBooks = state.deleted;
        } else if (this.unprocessedOnly) {
          this.comicBooks = state.unprocessed;
        } else {
          this.comicBooks = state.comicBooks;
        }
      });
    this.selectedSubscription = this.store
      .select(selectLibrarySelections)
      .subscribe(selectedIds => (this.selectedIds = selectedIds));
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Setting admin flag');
      this.isAdmin = isAdmin(user);
      this.logger.trace('Getting page size');
      this.pageSize = getPageSize(user);
      this.showCovers =
        getUserPreference(
          user.preferences,
          SHOW_COMIC_COVERS_PREFERENCE,
          `${true}`
        ) === `${true}`;
    });
    this.lastReadDatesSubscription = this.store
      .select(selectLastReadEntries)
      .subscribe(lastReadDates => {
        this.lastReadDates = lastReadDates;
        this.loadDataSource();
      });
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(lists => (this.readingLists = lists));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  get comicBooks(): ComicDetail[] {
    return this._comicDetails;
  }

  set comicBooks(comics: ComicDetail[]) {
    this.logger.debug('Setting comics:', comics);
    this._comicDetails = comics;
    this.logger.debug('Loading cover year options');
    this.coverYears = [
      { label: 'filtering.label.all-years', value: null } as ListItem<number>
    ].concat(
      comics
        .filter(comic => !!comic.coverDate)
        .map(comic => new Date(comic.coverDate).getFullYear())
        .filter((year, index, self) => index === self.indexOf(year))
        .sort((left, right) => left - right)
        .map(year => {
          return { value: year, label: `${year}` } as ListItem<number>;
        })
    );
    this.logger.debug('Loading cover month options');
    this.coverMonths = [
      { label: 'filtering.label.all-months', value: null }
    ].concat(
      Array.from(Array(12).keys()).map(month => {
        return {
          value: month,
          label: `filtering.label.month-${month}`
        } as ListItem<number>;
      })
    );
    this.loadDataSource();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up pagination');
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.logger.trace('Loading translations');
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
    this.comicBookListStateSubscription.unsubscribe();
    this.selectedSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
    this.readingListsSubscription.unsubscribe();
  }

  onSelectAll(): void {
    this.logger.debug('Selecting all comics');
    this.store.dispatch(
      selectComicBooks({
        ids: this.dataSource.filteredData.map(comic => comic.item.id)
      })
    );
  }

  onDeselectAll(): void {
    this.logger.debug('Deselecting all comics');
    this.store.dispatch(clearSelectedComicBooks());
  }

  onUpdateMetadata(): void {
    this.logger.trace('Confirming with the user to update metadata');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.trace('Firing action: update metadata');
        this.store.dispatch(
          updateMetadata({
            ids: this.selectedIds
          })
        );
      }
    });
  }

  onConsolidateSelectedComics(ids: number[]): void {
    this.doConsolidateLibrary(ids);
  }

  onConsolidateEntireLibrary(): void {
    this.doConsolidateLibrary([]);
  }

  onPurgeLibrary(): void {
    this.logger.trace('Confirming purging the library');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.purge-library.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.purge-library.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Firing action: purge library');
        this.store.dispatch(purgeLibrary({ ids: this.selectedIds }));
      }
    });
  }

  onScrapeComics(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'scraping.start-scraping.confirmation-title',
        { count: this.selectedIds.length }
      ),
      message: this.translateService.instant(
        'scraping.start-scraping.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.debug('Start scraping comics');
        this.router.navigate(['/library', 'scrape']);
      }
    });
  }

  onRescanComics(): void {
    this.logger.trace('Confirming with the user to rescan the selected comics');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.rescan-comics.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.rescan-comics.confirmation-message',
        { count: this.selectedIds.length }
      ),
      confirm: () => {
        this.logger.trace('Firing action to rescan comics');
        this.store.dispatch(
          rescanComics({
            comicBooks: this.comicBooks.filter(comic =>
              this.selectedIds.includes(comic.id)
            )
          })
        );
      }
    });
  }

  onToggleUnreadSwitch(): void {
    this.unreadSwitch = this.unreadSwitch === false;
    this.loadDataSource();
  }

  private doConsolidateLibrary(ids: number[]): void {
    this.logger.debug('Confirming with the user to consolidate library:', ids);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.consolidate.confirmation-title',
        { count: ids.length }
      ),
      message: this.translateService.instant(
        'library.consolidate.confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Firing action: consolidate library');
        this.store.dispatch(startLibraryConsolidation({ ids }));
      }
    });
  }

  private loadDataSource(): void {
    this.dataSource.data = this.comicBooks
      .filter(
        comic =>
          (!this.queryParameterService.coverYear$.getValue() ||
            ((!this.queryParameterService.coverYear$.getValue().year ||
              new Date(comic.coverDate).getFullYear() ===
                this.queryParameterService.coverYear$.getValue().year) &&
              (!this.queryParameterService.coverYear$.getValue().month ||
                new Date(comic.coverDate).getMonth() ===
                  this.queryParameterService.coverYear$.getValue().month))) &&
          (!this.queryParameterService.archiveType$.getValue() ||
            comic.archiveType ===
              this.queryParameterService.archiveType$.getValue())
      )
      .filter(
        comic =>
          !this.unreadOnly ||
          (this.unreadOnly &&
            (!this.unreadSwitch || (this.unreadSwitch && !this.isRead(comic))))
      )
      .map(comic => {
        return {
          item: comic,
          selected: this.selectedIds.includes(comic.id)
        };
      });
  }

  private loadTranslations(): void {
    this.logger.trace('Setting page title');
    if (this.unprocessedOnly) {
      this.titleService.setTitle(
        this.translateService.instant(
          'library.all-comics.tab-title-unprocessed'
        )
      );
    } else if (this.deletedOnly) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-deleted')
      );
    } else if (this.unscrapedOnly) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-unscraped')
      );
    } else if (this.changedOnly) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-changed')
      );
    } else if (this.unreadOnly) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-unread')
      );
    } else {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title')
      );
    }
  }

  private isRead(comic: ComicDetail): boolean {
    return (
      this.lastReadDates.findIndex(
        entry => entry.comicDetail.comicId === comic.comicId
      ) !== -1
    );
  }
}
