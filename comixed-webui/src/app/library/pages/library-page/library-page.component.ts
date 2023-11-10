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
import { ActivatedRoute } from '@angular/router';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { LastRead } from '@app/comic-books/models/last-read';
import { selectComicBookLastReadEntries } from '@app/comic-books/selectors/last-read-list.selectors';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { PAGE_SIZE_DEFAULT } from '@app/core';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  loadComicDetails,
  loadUnreadComicDetails
} from '@app/comic-books/actions/comic-details-list.actions';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  selectLoadComicDetailsCoverMonths,
  selectLoadComicDetailsCoverYears,
  selectLoadComicDetailsList,
  selectLoadComicDetailsListState,
  selectLoadComicDetailsTotalComics
} from '@app/comic-books/selectors/load-comic-details-list.selectors';
import { ComicDetailsListState } from '@app/comic-books/reducers/comic-details-list.reducer';
import { setMultipleComicBookByFilterSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';

@Component({
  selector: 'cx-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.scss']
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  comicDetailListStateSubscription: Subscription;
  comicDetailListState: ComicDetailsListState;
  comicsDetailListSubscription: Subscription;
  comicDetails: ComicDetail[] = [];
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
  lastReadDatesSubscription: Subscription;
  lastReadDates: LastRead[] = [];
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

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private queryParameterService: QueryParameterService
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
    this.comicDetailListStateSubscription = this.store
      .select(selectLoadComicDetailsListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
        this.comicDetailListState = state;
      });
    this.comicsDetailListSubscription = this.store
      .select(selectLoadComicDetailsList)
      .subscribe(comics => (this.comicDetails = comics));
    this.comicsDetailCoverYearsSubscription = this.store
      .select(selectLoadComicDetailsCoverYears)
      .subscribe(coverYears => (this.coverYears = coverYears));
    this.comicsDetailCoverMonthsSubscription = this.store
      .select(selectLoadComicDetailsCoverMonths)
      .subscribe(coverMonths => (this.coverMonths = coverMonths));
    this.loadComicsTotalSubscription = this.store
      .select(selectLoadComicDetailsTotalComics)
      .subscribe(total => (this.totalComics = total));
    this.selectedSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(selectedIds => (this.selectedIds = selectedIds));
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.debug('Setting admin flag');
      this.isAdmin = isAdmin(user);
      this.logger.debug('Getting page size');
      this.pageSize = getPageSize(user);
      this.showCovers =
        getUserPreference(
          user.preferences,
          SHOW_COMIC_COVERS_PREFERENCE,
          `${true}`
        ) === `${true}`;
    });
    this.lastReadDatesSubscription = this.store
      .select(selectComicBookLastReadEntries)
      .subscribe(lastReadDates => {
        this.lastReadDates = lastReadDates;
      });
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(lists => (this.readingLists = lists));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.pageChangedSubscription = this.activatedRoute.queryParams.subscribe(
      () => {
        if (this.unreadOnly) {
          this.store.dispatch(
            loadUnreadComicDetails({
              pageSize: this.queryParameterService.pageSize$.value,
              pageIndex: this.queryParameterService.pageIndex$.value,
              sortBy: this.queryParameterService.sortBy$.value,
              sortDirection: this.queryParameterService.sortDirection$.value
            })
          );
        } else {
          this.store.dispatch(
            loadComicDetails({
              pageSize: this.queryParameterService.pageSize$.value,
              pageIndex: this.queryParameterService.pageIndex$.value,
              coverYear: this.queryParameterService.coverYear$?.value?.year,
              coverMonth: this.queryParameterService.coverYear$?.value?.month,
              archiveType: this.queryParameterService.archiveType$.value,
              comicType: this.queryParameterService.comicType$.value,
              comicState: this.targetComicState,
              unscrapedState: this.unscrapedOnly,
              searchText: this.queryParameterService.filterText$.value,
              publisher: null,
              series: null,
              volume: null,
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
    this.comicDetailListStateSubscription.unsubscribe();
    this.comicsDetailListSubscription.unsubscribe();
    this.loadComicsTotalSubscription.unsubscribe();
    this.selectedSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
    this.readingListsSubscription.unsubscribe();
    this.pageChangedSubscription.unsubscribe();
  }

  onSetAllComicsSelectedState(selected: boolean) {
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

  private loadTranslations(): void {
    this.logger.debug('Setting page title');
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
