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

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { setBusyState } from '@app/core/actions/busy.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import {
  getPageSize,
  getUserPreference,
  isAdmin
} from '@app/user/user.functions';
import { ActivatedRoute } from '@angular/router';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { PAGE_SIZE_DEFAULT, QUERY_PARAM_UNREAD_ONLY } from '@app/core';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  setComicBookSelectionByUnreadState,
  setDuplicateComicBooksSelectionState,
  setMultipleComicBookByFilterSelectionState
} from '@app/comic-books/actions/comic-book-selection.actions';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { selectReadComicBooksList } from '@app/user/selectors/read-comic-books.selectors';
import {
  loadComicsByFilter,
  loadDuplicateComics,
  loadReadComics,
  loadUnreadComics
} from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicCoverMonths,
  selectComicCoverYears,
  selectComicList,
  selectComicListState,
  selectComicTotalCount
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicListState } from '@app/comic-books/reducers/comic-list.reducer';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { ComicListViewComponent } from '../../../comic-books/components/comic-list-view/comic-list-view.component';

@Component({
  selector: 'cx-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    ComicListViewComponent,
    TranslateModule
  ]
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  comicListStateSubscription: Subscription;
  comicListState: ComicListState;
  comicsDetailListSubscription: Subscription;
  comics: DisplayableComic[] = [];
  comicsDetailCoverYearsSubscription: Subscription;
  coverYears: number[] = [];
  comicsDetailCoverMonthsSubscription: Subscription;
  coverMonths: number[] = [];
  loadComicsTotalSubscription: Subscription;
  totalComics = 0;
  selectedSubscription: Subscription;
  selectedIds: number[] = [];
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  isAdmin = false;
  filtered = false;
  showing = 0;
  showUpdateMetadata = false;
  showOrganize = false;
  showPurge = false;
  dataSubscription: Subscription;
  selectedOnly = false;
  unreadOnly = false;
  showReadOnly = true;
  unscrapedOnly = false;
  changedOnly = false;
  deletedOnly = false;
  unprocessedOnly = false;
  duplicatesOnly = false;
  lastReadDatesSubscription: Subscription;
  comicBooksRead: number[] = [];
  readingListsSubscription: Subscription;
  pageChangedSubscription: Subscription;
  readingLists: ReadingList[] = [];
  pageContent = 'comics';
  showCovers = true;
  readonly archiveTypeOptions: SelectionOption<ArchiveType>[] = [
    { label: 'archive-type.label.all', value: null },
    { label: 'archive-type.label.cbz', value: ArchiveType.CBZ },
    { label: 'archive-type.label.cbr', value: ArchiveType.CBR },
    { label: 'archive-type.label.cb7', value: ArchiveType.CB7 }
  ];
  readonly comicTypeOptions: SelectionOption<ComicType>[] = [
    { label: 'comic-type.label.all', value: null },
    { label: 'comic-type.label.issue', value: ComicType.ISSUE },
    { label: 'comic-type.label.manga', value: ComicType.MANGA },
    {
      label: 'comic-type.label.trade-paperback',
      value: ComicType.TRADEPAPERBACK
    }
  ];

  logger = inject(LoggerService);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  activatedRoute = inject(ActivatedRoute);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.dataSubscription = this.activatedRoute.data.subscribe(data => {
      this.selectedOnly = !!data.selected && data.selected === true;
      this.unreadOnly = !!data.unread && data.unread === true;
      this.unscrapedOnly = !!data.unscraped && data.unscraped === true;
      this.changedOnly = !!data.changed && data.changed === true;
      this.deletedOnly = !!data.deleted && data.deleted === true;
      this.unprocessedOnly = !!data.unprocessed && data.unprocessed === true;
      this.duplicatesOnly = !!data.duplicates && data.duplicates === true;
      this.showUpdateMetadata = !this.unprocessedOnly && !this.deletedOnly;
      this.showOrganize =
        !this.unreadOnly && !this.unscrapedOnly && !this.deletedOnly;
      this.showPurge = this.deletedOnly;
      this.pageContent = 'all';
      if (this.selectedOnly) {
        this.pageContent = 'selected-only';
      }
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
      if (this.duplicatesOnly) {
        this.pageContent = 'duplicates-only';
      }
    });
    this.comicListStateSubscription = this.store
      .select(selectComicListState)
      .subscribe(state => {
        this.comicListState = state;
        this.store.dispatch(setBusyState({ enabled: state.busy }));
      });
    this.comicsDetailListSubscription = this.store
      .select(selectComicList)
      .subscribe(comics => (this.comics = comics));
    this.comicsDetailCoverYearsSubscription = this.store
      .select(selectComicCoverYears)
      .subscribe(coverYears => (this.coverYears = coverYears));
    this.comicsDetailCoverMonthsSubscription = this.store
      .select(selectComicCoverMonths)
      .subscribe(coverMonths => (this.coverMonths = coverMonths));
    this.loadComicsTotalSubscription = this.store
      .select(selectComicTotalCount)
      .subscribe(total => (this.totalComics = total));
    this.selectedSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(selectedIds => (this.selectedIds = selectedIds));
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.debug('Setting admin flag');
      this.isAdmin = isAdmin(user);
      this.logger.debug('Getting page size');
      const usersPreferredPageSize = getPageSize(user);
      if (this.queryParameterService.pageSize$.value === PAGE_SIZE_DEFAULT) {
        if (usersPreferredPageSize !== PAGE_SIZE_DEFAULT) {
          this.queryParameterService.pageSize$.next(usersPreferredPageSize);
        }
      }
      this.showCovers =
        getUserPreference(
          user.preferences,
          SHOW_COMIC_COVERS_PREFERENCE,
          `${true}`
        ) === `${true}`;
      this.comicBooksRead = user.readComicBooks;
    });
    this.lastReadDatesSubscription = this.store
      .select(selectReadComicBooksList)
      .subscribe(comicBooksRead => {
        this.comicBooksRead = comicBooksRead;
      });
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(lists => (this.readingLists = lists));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.pageChangedSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        if (this.unreadOnly) {
          this.showReadOnly =
            !params[QUERY_PARAM_UNREAD_ONLY] ||
            params[QUERY_PARAM_UNREAD_ONLY] === `${true}`;
          if (this.showReadOnly) {
            this.logger.debug('Loading read comics');
            this.pageContent = 'read-only';
            this.store.dispatch(
              loadReadComics({
                pageSize: this.queryParameterService.pageSize$.value,
                pageIndex: this.queryParameterService.pageIndex$.value,
                sortBy: this.queryParameterService.sortBy$.value,
                sortDirection: this.queryParameterService.sortDirection$.value
              })
            );
          } else {
            this.logger.debug('Loading unread comics');
            this.pageContent = 'unread-only';
            this.store.dispatch(
              loadUnreadComics({
                pageSize: this.queryParameterService.pageSize$.value,
                pageIndex: this.queryParameterService.pageIndex$.value,
                sortBy: this.queryParameterService.sortBy$.value,
                sortDirection: this.queryParameterService.sortDirection$.value
              })
            );
          }
        } else if (this.duplicatesOnly) {
          this.logger.debug('Loading duplicate comics');
          this.pageContent = 'duplicates-only';
          this.store.dispatch(
            loadDuplicateComics({
              pageSize: this.queryParameterService.pageSize$.value,
              pageIndex: this.queryParameterService.pageIndex$.value,
              sortBy: this.queryParameterService.sortBy$.value,
              sortDirection: this.queryParameterService.sortDirection$.value
            })
          );
        } else {
          this.store.dispatch(
            loadComicsByFilter({
              pageSize: this.queryParameterService.pageSize$.value,
              pageIndex: this.queryParameterService.pageIndex$.value,
              coverYear: this.queryParameterService.coverYear$?.value?.year,
              coverMonth: this.queryParameterService.coverYear$?.value?.month,
              archiveType: this.queryParameterService.archiveType$.value,
              comicType: this.queryParameterService.comicType$.value,
              comicState: this.targetComicState,
              selected: this.selectedOnly,
              unscrapedState: this.unscrapedOnly,
              searchText: this.queryParameterService.filterText$.value,
              publisher: null,
              series: null,
              volume: null,
              pageCount: this.queryParameterService.pageCount$.value,
              sortBy: this.queryParameterService.sortBy$.value,
              sortDirection: this.queryParameterService.sortDirection$.value
            })
          );
        }
      }
    );
  }

  private get targetComicState(): ComicState {
    if (this.unprocessedOnly) {
      return ComicState.UNPROCESSED;
    }
    if (this.deletedOnly) {
      return ComicState.DELETED;
    }
    if (this.changedOnly) {
      return ComicState.CHANGED;
    }
    return null;
  }

  ngOnInit(): void {
    this.logger.debug('Loading translations');
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    this.comicListStateSubscription.unsubscribe();
    this.comicsDetailListSubscription.unsubscribe();
    this.loadComicsTotalSubscription.unsubscribe();
    this.selectedSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
    this.readingListsSubscription.unsubscribe();
    this.pageChangedSubscription.unsubscribe();
  }

  onSetAllComicsSelectedState(selected: boolean) {
    if (this.duplicatesOnly) {
      this.logger.debug(
        'Setting all duplicate comic books selected state:',
        selected
      );
      this.store.dispatch(setDuplicateComicBooksSelectionState({ selected }));
    } else if (this.unreadOnly) {
      this.logger.debug(
        'Setting all comic books selected state based on read state:',
        selected,
        this.showReadOnly
      );
      this.store.dispatch(
        setComicBookSelectionByUnreadState({
          selected,
          unreadOnly: !this.showReadOnly
        })
      );
    } else {
      this.logger.debug('Setting all comic books selected state:', selected);
      this.store.dispatch(
        setMultipleComicBookByFilterSelectionState({
          coverYear: this.queryParameterService.coverYear$?.value?.year,
          coverMonth: this.queryParameterService.coverYear$?.value?.month,
          archiveType: this.queryParameterService.archiveType$.value,
          comicType: this.queryParameterService.comicType$.value,
          comicState: this.targetComicState,
          unscrapedState: this.unscrapedOnly,
          searchText: this.queryParameterService.filterText$.value,
          selected
        })
      );
    }
  }

  onToggleUnreadOnly(): void {
    this.logger.debug('Toggling showing unread comics');
    this.queryParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_UNREAD_ONLY,
        value: `${!this.showReadOnly}`
      }
    ]);
  }

  private loadTranslations(): void {
    this.logger.debug('Setting page title');
    if (this.selectedOnly) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-selected')
      );
    } else if (this.unprocessedOnly) {
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
    } else if (this.duplicatesOnly) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-duplicates')
      );
    } else {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title')
      );
    }
  }
}
