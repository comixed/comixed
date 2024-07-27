/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import { Subscription } from 'rxjs';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  selectLoadComicDetailsFilteredComics,
  selectLoadComicDetailsList,
  selectLoadComicDetailsListState
} from '@app/comic-books/selectors/load-comic-details-list.selectors';
import { loadComicDetails } from '@app/comic-books/actions/comic-details-list.actions';
import { setBusyState } from '@app/core/actions/busy.actions';

@Component({
  selector: 'cx-series-issue-page',
  templateUrl: './series-issue-page.component.html',
  styleUrl: './series-issue-page.component.scss'
})
export class SeriesIssuePageComponent implements OnDestroy {
  paramSubscription: Subscription;
  pageChangedSubscription: Subscription;
  comicDetailslistSubscription: Subscription;
  comicDetailslistStateSubscription: Subscription;
  comicDetailsTotalSubscription: Subscription;

  publisherName = '';
  seriesName = '';
  volume = '';
  comicDetails: ComicDetail[] = [];
  totalComics = 0;

  constructor(
    private logger: LoggerService,
    private store: Store,
    private activatedRoute: ActivatedRoute,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to parameter updates');
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.publisherName = params['publisher'];
      this.seriesName = params['name'];
      this.volume = params['volume'];
      this.doLoadComicDetails();
    });
    this.logger.trace('Subscribing to page change updates');
    this.pageChangedSubscription = this.activatedRoute.queryParams.subscribe(
      params => this.doLoadComicDetails()
    );
    this.logger.trace('Subscribing to comic detail list state updates');
    this.comicDetailslistStateSubscription = this.store
      .select(selectLoadComicDetailsListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
      });
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
    this.logger.trace('Unsubscribing from param updates');
    this.paramSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from page change updates');
    this.pageChangedSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from comic detail list state updates');
    this.comicDetailslistStateSubscription.unsubscribe();
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
        publisher: this.publisherName,
        series: this.seriesName,
        volume: this.volume
      })
    );
  }
}
