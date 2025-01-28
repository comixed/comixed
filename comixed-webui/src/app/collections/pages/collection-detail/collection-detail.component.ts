/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReadingList } from '@app/lists/models/reading-list';
import { selectUserReadingLists } from '@app/lists/selectors/reading-lists.selectors';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference, isAdmin } from '@app/user/user.functions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { setMultipleComicBooksByTagTypeAndValueSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadComicsForCollection } from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicCoverMonths,
  selectComicCoverYears,
  selectComicFilteredCount,
  selectComicList,
  selectComicListState
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import {
  ComicTagType,
  comicTagTypeFromString
} from '@app/comic-books/models/comic-tag-type';

@Component({
  selector: 'cx-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})
export class CollectionDetailComponent implements OnInit, OnDestroy {
  comics: DisplayableComic[] = [];
  totalComics = 0;
  coverYears: number[] = [];
  coverMonths: number[] = [];

  paramsSubscription: Subscription;
  queryParamsSubscription: Subscription;
  comicDetailListStateSubscription: Subscription;
  comicDetailListSubscription: Subscription;
  totalComicsSubscription: Subscription;
  coverYearSubscription: Subscription;
  coverMonthsSubscription: Subscription;
  routableTypeName: string;
  tagType: ComicTagType;
  tagValue: string;
  selectedSubscription: Subscription;
  selectedIds: number[] = [];
  lastReadDates: number[] = [];
  readingListsSubscription: Subscription;
  readingLists: ReadingList[] = [];
  userSubscription: Subscription;
  isAdmin = false;
  langChangeSubscription: Subscription;
  showCovers = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private titleService: TitleService,
    public queryParameterService: QueryParameterService
  ) {
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      () => this.doLoadComicDetails()
    );
    this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
      this.routableTypeName = params.collectionType;
      this.tagValue = params.collectionName;
      this.tagType = comicTagTypeFromString(this.routableTypeName);
      if (!this.tagType) {
        this.logger.error('Invalid collection type:', params.collectionType);
        this.router.navigateByUrl('/library');
      } else {
        this.loadTranslations();
        this.doLoadComicDetails();
        this.comicDetailListStateSubscription = this.store
          .select(selectComicListState)
          .subscribe(state =>
            this.store.dispatch(setBusyState({ enabled: state.busy }))
          );
        this.comicDetailListSubscription = this.store
          .select(selectComicList)
          .subscribe(entries => (this.comics = entries));
        this.totalComicsSubscription = this.store
          .select(selectComicFilteredCount)
          .subscribe(totalComics => (this.totalComics = totalComics));
        this.coverYearSubscription = this.store
          .select(selectComicCoverYears)
          .subscribe(coverYears => (this.coverYears = coverYears));
        this.coverMonthsSubscription = this.store
          .select(selectComicCoverMonths)
          .subscribe(coverMonths => (this.coverMonths = coverMonths));
      }
    });
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Setting isAdmin flag');
      this.isAdmin = isAdmin(user);
      this.showCovers =
        getUserPreference(
          user.preferences,
          SHOW_COMIC_COVERS_PREFERENCE,
          `${true}`
        ) === `${true}`;
    });
    this.selectedSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(selectedIds => (this.selectedIds = selectedIds));
    this.readingListsSubscription = this.store
      .select(selectUserReadingLists)
      .subscribe(lists => (this.readingLists = lists));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from query parameter events');
    this.queryParamsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from parameter events');
    this.paramsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic list state updates');
    this.comicDetailListStateSubscription?.unsubscribe();
    this.logger.trace('Unsubscribing from comic list updates');
    this.comicDetailListSubscription?.unsubscribe();
    this.logger.trace('Unsubscribing from total comics updates');
    this.totalComicsSubscription?.unsubscribe();
    this.logger.trace('Unsubscribing from cover year updates');
    this.coverYearSubscription?.unsubscribe();
    this.logger.trace('Unsubscribing from cover month updates');
    this.coverMonthsSubscription?.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from reading list updates');
    this.readingListsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from language change events');
    this.langChangeSubscription.unsubscribe();
  }

  onSelectAll(selected: boolean): void {
    this.logger.debug(
      `Marking comic books as ${selected ? 'selected' : 'deselected'}`
    );
    this.store.dispatch(
      setMultipleComicBooksByTagTypeAndValueSelectionState({
        tagType: this.tagType,
        tagValue: this.tagValue,
        selected
      })
    );
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('collection-detail.tab-title', {
        tagType: this.tagType,
        tagValue: this.tagValue
      })
    );
  }

  private doLoadComicDetails(): void {
    this.store.dispatch(
      loadComicsForCollection({
        pageSize: this.queryParameterService.pageSize$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        tagType: this.tagType,
        tagValue: this.tagValue,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }
}
