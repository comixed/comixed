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

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { setBusyState } from '@app/core/actions/busy.actions';
import { setMultipleComicBookByPublisherSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { selectUser } from '@app/user/selectors/user.selectors';
import { isAdmin } from '@app/user/user.functions';
import { loadComicsByFilter } from '@app/comic-books/actions/comic-list.actions';
import {
  selectComicFilteredCount,
  selectComicList,
  selectComicListState
} from '@app/comic-books/selectors/comic-list.selectors';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicListViewComponent } from '../../../comic-books/components/comic-list-view/comic-list-view.component';

@Component({
  selector: 'cx-publisher-issues-page',
  templateUrl: './publisher-issues-page.component.html',
  styleUrl: './publisher-issues-page.component.scss',
  imports: [ComicListViewComponent, TranslateModule]
})
export class PublisherIssuesPageComponent implements OnInit, OnDestroy {
  paramSubscription: Subscription;
  langChangeSubscription: Subscription;
  comicDetailListStateSubscription: Subscription;
  pageChangedSubscription: Subscription;
  comicDetailslistSubscription: Subscription;
  comicDetailsTotalSubscription: Subscription;
  selectionsSubscription: Subscription;
  currentUserSubscription: Subscription;

  name = '';
  isAdmin = false;
  comics: DisplayableComic[] = [];
  totalComics = 0;
  selectedIds: number[];
  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);

  constructor() {
    this.logger.trace('Subscribing to comic detail list state updates');
    this.comicDetailListStateSubscription = this.store
      .select(selectComicListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.busy }));
      });
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to parameter updates');
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.name = params['name'];
      this.doLoadComicDetails();
    });
    this.logger.trace('Subscribing to page change updates');
    this.pageChangedSubscription = this.activatedRoute.queryParams.subscribe(
      params => this.doLoadComicDetails()
    );
    this.logger.trace('Subscribing to comic details updates');
    this.comicDetailslistSubscription = this.store
      .select(selectComicList)
      .subscribe(comics => (this.comics = comics));
    this.logger.trace('Subscribing to comic detail totals updates');
    this.comicDetailsTotalSubscription = this.store
      .select(selectComicFilteredCount)
      .subscribe(totalComics => (this.totalComics = totalComics));
    this.logger.trace('Subscribing to comic selections updates');
    this.selectionsSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(selectedIds => (this.selectedIds = selectedIds));
    this.logger.trace('Subscribing to user updates');
    this.currentUserSubscription = this.store
      .select(selectUser)
      .subscribe(user => (this.isAdmin = isAdmin(user)));
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from comic detail list state updates');
    this.comicDetailListStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from param updates');
    this.paramSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from language updates');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from page change updates');
    this.pageChangedSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic detail list updates');
    this.comicDetailslistSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic detail total updates');
    this.comicDetailsTotalSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic selection updates');
    this.selectionsSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.currentUserSubscription.unsubscribe();
  }

  onSelectAll(selected: boolean): void {
    this.logger.debug('Setting all comic books selected state:', selected);
    this.store.dispatch(
      setMultipleComicBookByPublisherSelectionState({
        publisher: this.name,
        selected
      })
    );
  }

  private doLoadComicDetails() {
    this.store.dispatch(
      loadComicsByFilter({
        pageSize: this.queryParameterService.pageSize$.value,
        pageIndex: this.queryParameterService.pageIndex$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value,
        coverYear: this.queryParameterService.coverYear$.value?.year,
        coverMonth: this.queryParameterService.coverYear$.value?.month,
        archiveType: this.queryParameterService.archiveType$.value,
        comicType: this.queryParameterService.comicType$.value,
        comicState: null,
        selected: false,
        missing: false,
        unscrapedState: false,
        searchText: null,
        publisher: this.name,
        series: null,
        volume: null,
        pageCount: null
      })
    );
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant(
        'collections.publishers.list-issues-page.tab-title',
        { publisher: this.name }
      )
    );
  }
}
