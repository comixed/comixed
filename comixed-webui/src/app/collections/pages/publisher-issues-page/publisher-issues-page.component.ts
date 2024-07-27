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

import { Component, OnDestroy } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { Subscription } from 'rxjs';
import { loadComicDetails } from '@app/comic-books/actions/comic-details-list.actions';
import {
  selectLoadComicDetailsFilteredComics,
  selectLoadComicDetailsList,
  selectLoadComicDetailsListState
} from '@app/comic-books/selectors/load-comic-details-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';

@Component({
  selector: 'cx-publisher-issues-page',
  templateUrl: './publisher-issues-page.component.html',
  styleUrl: './publisher-issues-page.component.scss'
})
export class PublisherIssuesPageComponent implements OnDestroy {
  paramSubscription: Subscription;
  comicDetailListStateSubscription: Subscription;
  pageChangedSubscription: Subscription;
  comicDetailslistSubscription: Subscription;
  comicDetailsTotalSubscription: Subscription;

  name = '';
  comicDetails: ComicDetail[] = [];
  totalComics = 0;

  constructor(
    private logger: LoggerService,
    private store: Store,
    private activatedRoute: ActivatedRoute,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to comic detail list state updates');
    this.comicDetailListStateSubscription = this.store
      .select(selectLoadComicDetailsListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
      });
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
      .select(selectLoadComicDetailsList)
      .subscribe(comicDetails => (this.comicDetails = comicDetails));
    this.logger.trace('Subscribing to comic detail totals updates');
    this.comicDetailsTotalSubscription = this.store
      .select(selectLoadComicDetailsFilteredComics)
      .subscribe(totalComics => (this.totalComics = totalComics));
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from comic detail list state updates');
    this.comicDetailListStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from param updates');
    this.paramSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from page change updates');
    this.pageChangedSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic detail list updates');
    this.comicDetailslistSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic detail total updates');
    this.comicDetailsTotalSubscription.unsubscribe();
  }

  private doLoadComicDetails() {
    this.store.dispatch(
      loadComicDetails({
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
        unscrapedState: false,
        searchText: null,
        publisher: this.name,
        series: null,
        volume: null
      })
    );
  }
}
