/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { loadDuplicateComics } from '@app/library/actions/duplicate-comics.actions';
import {
  selectComicList,
  selectComicListState
} from '@app/comic-books/selectors/comic-list.selectors';
import { ComicListViewComponent } from '@app/comic-books/components/comic-list-view/comic-list-view.component';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { loadComicBookSelections } from '@app/comic-books/actions/comic-book-selection.actions';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { setBusyState } from '@app/core/actions/busy.actions';

@Component({
  selector: 'cx-duplicate-comics-detail-page',
  imports: [
    ComicListViewComponent,
    TranslatePipe,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './duplicate-comics-detail-page.component.html',
  styleUrl: './duplicate-comics-detail-page.component.scss'
})
export class DuplicateComicsDetailPageComponent implements OnInit, OnDestroy {
  logger = inject(LoggerService);
  store = inject(Store);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  queryParameterService = inject(QueryParameterService);

  dataSubscription: Subscription;
  queryParamsSubscription: Subscription;
  publisher = '';
  series = '';
  volume = '';
  issueNumber = '';
  coverDate = new Date();

  comicListStateSubscription: Subscription;
  totalDuplicates = 0;
  comicListSubscription: Subscription;
  comicList: DisplayableComic[] = [];
  selectedIdSubscription: Subscription;
  selectedIds: number[] = [];

  constructor() {
    this.logger.debug('Subscribing to router data');
    this.dataSubscription = this.activatedRoute.params.subscribe(params => {
      this.publisher = params.publisher;
      this.series = params.series;
      this.volume = params.volume;
      this.issueNumber = params.issueNumber;
      this.coverDate = new Date(params.coverDate);
      this.doLoadComicDetails();
    });
    this.logger.trace('Subscribing to parameter updates');
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        this.doLoadComicDetails();
      }
    );
    this.logger.debug('Subscribing to comic list state updates');
    this.comicListStateSubscription = this.store
      .select(selectComicListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.busy }));
        this.totalDuplicates = state.totalCount;
      });
    this.logger.debug('Subscribing to comic list updates');
    this.comicListSubscription = this.store
      .select(selectComicList)
      .subscribe(comicList => (this.comicList = comicList));
    this.logger.debug('Subscribing to selection updates');
    this.selectedIdSubscription = this.store
      .select(selectComicBookSelectionIds)
      .subscribe(ids => (this.selectedIds = ids));
  }

  ngOnInit(): void {
    this.logger.debug('Loading selected ids');
    this.store.dispatch(loadComicBookSelections());
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from parameter updates');
    this.queryParamsSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from data list updates');
    this.dataSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from comic list state updates');
    this.comicListStateSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from comic list updates');
    this.comicListSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from selection updates');
    this.selectedIdSubscription.unsubscribe();
  }

  private doLoadComicDetails() {
    this.store.dispatch(
      loadDuplicateComics({
        publisher: this.publisher,
        series: this.series,
        volume: this.volume,
        issueNumber: this.issueNumber,
        coverDate: this.coverDate.getTime(),
        pageIndex: this.queryParameterService.pageIndex$.value,
        pageSize: this.queryParameterService.pageSize$.value,
        sortBy: this.queryParameterService.sortBy$.value,
        sortDirection: this.queryParameterService.sortDirection$.value
      })
    );
  }
}
