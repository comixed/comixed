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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
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
import {
  selectComicBookListFilter,
  selectComicBookListState
} from '@app/comic-books/selectors/comic-book-list.selectors';
import {
  ArchiveType,
  archiveTypeFromString
} from '@app/comic-books/models/archive-type.enum';
import {
  PAGE_SIZE_DEFAULT,
  QUERY_PARAM_ARCHIVE_TYPE,
  QUERY_PARAM_PAGE_INDEX,
  SHOW_COMIC_COVERS_PREFERENCE,
  SORT_FIELD_DEFAULT,
  SORT_FIELD_PREFERENCE
} from '@app/library/library.constants';
import { updateQueryParam } from '@app/core';
import { LastRead } from '@app/last-read/models/last-read';
import { selectLastReadEntries } from '@app/last-read/selectors/last-read-list.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import { selectLibrarySelections } from '@app/library/selectors/library-selections.selectors';
import {
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';

@Component({
  selector: 'cx-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.scss']
})
export class LibraryPageComponent implements OnInit, OnDestroy {
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
  unscrapedOnly = false;
  changedOnly = false;
  deletedOnly = false;
  unprocessedOnly = false;
  queryParamSubscription: Subscription;
  archiveTypeFilter = null;
  pageIndex = 0;
  sortField = SORT_FIELD_DEFAULT;
  lastReadDatesSubscription: Subscription;
  lastReadDates: LastRead[];
  readingListsSubscription: Subscription;
  readingLists: ReadingList[] = [];
  pageContent = 'comics';
  coverDateFilter: CoverDateFilter;
  coverDateFilterSubscription: Subscription;
  showCovers = true;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
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
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        if (!!params[QUERY_PARAM_ARCHIVE_TYPE]) {
          const archiveType = params[QUERY_PARAM_ARCHIVE_TYPE];
          this.logger.debug('Received archive type query param:', archiveType);
          this.archiveTypeFilter = archiveTypeFromString(archiveType);
        } else {
          this.logger.debug('Resetting archive type filter');
          this.archiveTypeFilter = null;
        }
        if (!!params[QUERY_PARAM_PAGE_INDEX]) {
          this.pageIndex = +params[QUERY_PARAM_PAGE_INDEX];
          this.logger.debug(`Page index: ${this.pageIndex}`);
        }
      }
    );
    this.comicBookListStateSubscription = this.store
      .select(selectComicBookListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
        if (this.unscrapedOnly) {
          this._comicBooks = state.unscraped;
        } else if (this.changedOnly) {
          this._comicBooks = state.changed;
        } else if (this.deletedOnly) {
          this._comicBooks = state.deleted;
        } else if (this.unprocessedOnly) {
          this._comicBooks = state.unprocessed;
        } else {
          this._comicBooks = state.comicBooks;
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
      this.sortField = getUserPreference(
        user.preferences,
        SORT_FIELD_PREFERENCE,
        SORT_FIELD_DEFAULT
      );
      this.showCovers =
        getUserPreference(
          user.preferences,
          SHOW_COMIC_COVERS_PREFERENCE,
          `${true}`
        ) === `${true}`;
    });
    this.lastReadDatesSubscription = this.store
      .select(selectLastReadEntries)
      .subscribe(lastReadDates => (this.lastReadDates = lastReadDates));
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(lists => (this.readingLists = lists));
    this.coverDateFilterSubscription = this.store
      .select(selectComicBookListFilter)
      .subscribe(filter => (this.coverDateFilter = filter));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  private _comicBooks: ComicBook[] = [];

  get comicBooks(): ComicBook[] {
    return this._comicBooks;
  }

  set comicBooks(comics: ComicBook[]) {
    this._comicBooks = comics;
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    this.comicBookListStateSubscription.unsubscribe();
    this.selectedSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
    this.readingListsSubscription.unsubscribe();
    this.coverDateFilterSubscription.unsubscribe();
  }

  onArchiveTypeChanged(archiveType: ArchiveType): void {
    this.logger.debug('Archive type changed:', archiveType);
    updateQueryParam(
      this.activatedRoute,
      this.router,
      QUERY_PARAM_ARCHIVE_TYPE,
      !!archiveType ? `${archiveType}` : null
    );
  }

  onPageIndexChange(pageIndex: number): void {
    this.logger.debug('Page index changed:', pageIndex);
    updateQueryParam(
      this.activatedRoute,
      this.router,
      QUERY_PARAM_PAGE_INDEX,
      `${pageIndex}`
    );
  }

  onSelectAllComics(selected: boolean): void {
    if (selected) {
      this.logger.trace('Selecting all comics');
      this.store.dispatch(
        selectComicBooks({
          ids: this.comicBooks.map(comicBook => comicBook.id)
        })
      );
    } else {
      this.logger.trace('Deselecting all comics');
      this.store.dispatch(deselectComicBooks({ ids: this.selectedIds }));
    }
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
}
