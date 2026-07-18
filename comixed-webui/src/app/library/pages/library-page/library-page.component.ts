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

import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  setMultipleComicBookByFilterSelectionState
} from '@app/comic-books/actions/comic-book-selection.actions';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { selectReadComicBooksList } from '@app/user/selectors/read-comic-books.selectors';
import {
  loadComicsByFilter,
  loadReadComics,
  loadUnreadComics
} from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicCoverMonths,
  selectComicCoverYears,
  selectComicFilteredCount,
  selectComicList,
  selectComicListBusy
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { ComicListViewComponent } from '../../../comic-books/components/comic-list-view/comic-list-view.component';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    ComicListViewComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class LibraryPageComponent implements OnInit {
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

  filteredCount$ = new BehaviorSubject(0);
  comics$ = new BehaviorSubject<DisplayableComic[]>([]);
  coverYears$ = new BehaviorSubject<number[]>([]);
  coverMonths$ = new BehaviorSubject<number[]>([]);
  selectedIds$ = new BehaviorSubject<number[]>([]);
  isAdmin$ = new BehaviorSubject(false);
  filtered$ = new BehaviorSubject(false);
  showing$ = new BehaviorSubject(0);
  showUpdateMetadata$ = new BehaviorSubject(false);
  showOrganize$ = new BehaviorSubject(false);
  showPurge$ = new BehaviorSubject(false);
  selectedOnly$ = new BehaviorSubject(false);
  unreadOnly$ = new BehaviorSubject(false);
  showReadOnly$ = new BehaviorSubject(true);
  unscrapedOnly$ = new BehaviorSubject(false);
  changedOnly$ = new BehaviorSubject(false);
  deletedOnly$ = new BehaviorSubject(false);
  missingOnly$ = new BehaviorSubject(false);
  unprocessedOnly$ = new BehaviorSubject(false);
  comicBooksRead$ = new BehaviorSubject<number[]>([]);
  readingLists$ = new BehaviorSubject<ReadingList[]>([]);
  pageContent$ = new BehaviorSubject('comics');
  showCovers$ = new BehaviorSubject(true);

  logger = inject(LoggerService);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  activatedRoute = inject(ActivatedRoute);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.activatedRoute.data
      .pipe(
        tap(data => {
          this.selectedOnly$.next(!!data.selected && data.selected === true);
          this.unreadOnly$.next(!!data.unread && data.unread === true);
          this.unscrapedOnly$.next(!!data.unscraped && data.unscraped === true);
          this.changedOnly$.next(!!data.changed && data.changed === true);
          this.deletedOnly$.next(!!data.deleted && data.deleted === true);
          this.missingOnly$.next(!!data.missing && data.missing === true);
          this.unprocessedOnly$.next(
            !!data.unprocessed && data.unprocessed === true
          );
          this.showUpdateMetadata$.next(
            !this.unprocessedOnly$.value && !this.deletedOnly$.value
          );
          this.showOrganize$.next(
            !this.unreadOnly$.value &&
              !this.unscrapedOnly$.value &&
              !this.deletedOnly$.value
          );
          this.showPurge$.next(this.deletedOnly$.value);
          this.pageContent$.next('all');
          if (this.selectedOnly$.value) {
            this.pageContent$.next('selected-only');
          }
          if (this.unreadOnly$.value) {
            this.pageContent$.next('unread-only');
          }
          if (this.unscrapedOnly$.value) {
            this.pageContent$.next('unscraped-only');
          }
          if (this.changedOnly$.value) {
            this.pageContent$.next('changed-only');
          }
          if (this.deletedOnly$.value) {
            this.pageContent$.next('deleted-only');
          }
          if (this.missingOnly$.value) {
            this.pageContent$.next('missing-only');
          }
          if (this.unprocessedOnly$.value) {
            this.pageContent$.next('unprocessed-only');
          }
        })
      )
      .subscribe();
    this.store
      .select(selectComicListBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectComicFilteredCount)
      .pipe(tap(filteredCount => this.filteredCount$.next(filteredCount)))
      .subscribe();
    this.store
      .select(selectComicList)
      .pipe(tap(comics => this.comics$.next(comics)))
      .subscribe();
    this.store
      .select(selectComicCoverYears)
      .pipe(tap(coverYears => this.coverYears$.next(coverYears)))
      .subscribe();
    this.store
      .select(selectComicCoverMonths)
      .pipe(tap(coverMonths => this.coverMonths$.next(coverMonths)))
      .subscribe();
    this.store
      .select(selectComicBookSelectionIds)
      .pipe(tap(selectedIds => this.selectedIds$.next(selectedIds)))
      .subscribe();
    this.store
      .select(selectUser)
      .pipe(
        tap(user => {
          this.logger.debug('Setting admin flag');
          this.isAdmin$.next(isAdmin(user));
          this.logger.debug('Getting page size');
          const usersPreferredPageSize = getPageSize(user);
          if (
            this.queryParameterService.pageSize$.value === PAGE_SIZE_DEFAULT
          ) {
            if (usersPreferredPageSize !== PAGE_SIZE_DEFAULT) {
              this.queryParameterService.pageSize$.next(usersPreferredPageSize);
            }
          }
          this.showCovers$.next(
            getUserPreference(
              user.preferences,
              SHOW_COMIC_COVERS_PREFERENCE,
              `${true}`
            ) === `${true}`
          );
          this.comicBooksRead$.next(user.readComicBooks);
        })
      )
      .subscribe();
    this.store
      .select(selectReadComicBooksList)
      .pipe(
        tap(comicBooksRead => {
          this.comicBooksRead$.next(comicBooksRead);
        })
      )
      .subscribe();
    this.store
      .select(selectUserReadingLists)
      .pipe(tap(lists => this.readingLists$.next(lists)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(
        tap(params => {
          if (this.unreadOnly$.value) {
            this.showReadOnly$.next(
              !params[QUERY_PARAM_UNREAD_ONLY] ||
                params[QUERY_PARAM_UNREAD_ONLY] === `${true}`
            );
            if (this.showReadOnly$.value) {
              this.logger.debug('Loading read comics');
              this.pageContent$.next('read-only');
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
              this.pageContent$.next('unread-only');
              this.store.dispatch(
                loadUnreadComics({
                  pageSize: this.queryParameterService.pageSize$.value,
                  pageIndex: this.queryParameterService.pageIndex$.value,
                  sortBy: this.queryParameterService.sortBy$.value,
                  sortDirection: this.queryParameterService.sortDirection$.value
                })
              );
            }
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
                selected: this.selectedOnly$.value,
                missing: this.missingOnly$.value,
                unscrapedState: this.unscrapedOnly$.value,
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
        })
      )
      .subscribe();
  }

  private get targetComicState(): ComicState {
    if (this.unprocessedOnly$.value) {
      return ComicState.UNPROCESSED;
    }
    if (this.deletedOnly$.value) {
      return ComicState.DELETED;
    }
    if (this.changedOnly$.value) {
      return ComicState.CHANGED;
    }
    return null;
  }

  ngOnInit(): void {
    this.logger.debug('Loading translations');
    this.loadTranslations();
  }

  onSetAllComicsSelectedState(selected: boolean) {
    if (this.unreadOnly$.value) {
      this.logger.debug(
        'Setting all comic books selected state based on read state:',
        selected,
        this.showReadOnly$.value
      );
      this.store.dispatch(
        setComicBookSelectionByUnreadState({
          selected,
          unreadOnly: !this.showReadOnly$.value
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
          unscrapedState: this.unscrapedOnly$.value,
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
        value: `${!this.showReadOnly$.value}`
      }
    ]);
  }

  private loadTranslations(): void {
    this.logger.debug('Setting page title');
    if (this.selectedOnly$.value) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-selected')
      );
    } else if (this.unprocessedOnly$.value) {
      this.titleService.setTitle(
        this.translateService.instant(
          'library.all-comics.tab-title-unprocessed'
        )
      );
    } else if (this.deletedOnly$.value) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-deleted')
      );
    } else if (this.missingOnly$.value) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-missing')
      );
    } else if (this.unscrapedOnly$.value) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-unscraped')
      );
    } else if (this.changedOnly$.value) {
      this.titleService.setTitle(
        this.translateService.instant('library.all-comics.tab-title-changed')
      );
    } else if (this.unreadOnly$.value) {
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
