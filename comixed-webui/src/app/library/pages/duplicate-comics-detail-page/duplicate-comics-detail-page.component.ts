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

import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { loadDuplicateComics } from '@app/library/actions/duplicate-comics.actions';
import {
  selectComicList,
  selectComicListBusy,
  selectComicTotalCount
} from '@app/comic-books/selectors/comic-list.selectors';
import { ComicListViewComponent } from '@app/comic-books/components/comic-list-view/comic-list-view.component';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { selectComicBookSelectionIds } from '@app/comic-books/selectors/comic-book-selection.selectors';
import { loadComicBookSelections } from '@app/comic-books/actions/comic-book-selection.actions';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

import { setBusyState } from '@app/core/actions/busy.actions';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-duplicate-comics-detail-page',
  imports: [
    ComicListViewComponent,
    TranslatePipe,
    ReactiveFormsModule,
    AsyncPipe
  ],
  templateUrl: './duplicate-comics-detail-page.component.html',
  styleUrl: './duplicate-comics-detail-page.component.scss'
})
export class DuplicateComicsDetailPageComponent implements OnInit {
  publisher = '';
  series = '';
  volume = '';
  issueNumber = '';
  coverDate = new Date();

  totalDuplicates$ = new BehaviorSubject(0);
  comics$ = new BehaviorSubject<DisplayableComic[]>([]);
  selectedIds$ = new BehaviorSubject<number[]>([]);

  logger = inject(LoggerService);
  store = inject(Store);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  queryParameterService = inject(QueryParameterService);

  constructor() {
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.publisher = params.publisher;
          this.series = params.series;
          this.volume = params.volume;
          this.issueNumber = params.issueNumber;
          this.coverDate = new Date(params.coverDate);
          this.doLoadComicDetails();
        })
      )
      .subscribe();
    this.activatedRoute.queryParams
      .pipe(
        tap(params => {
          this.doLoadComicDetails();
        })
      )
      .subscribe();
    this.store
      .select(selectComicListBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectComicTotalCount)
      .pipe(tap(totalCount => this.totalDuplicates$.next(totalCount)))
      .subscribe();
    this.store
      .select(selectComicList)
      .pipe(tap(comicList => this.comics$.next(comicList)))
      .subscribe();
    this.store
      .select(selectComicBookSelectionIds)
      .pipe(tap(ids => this.selectedIds$.next(ids)))
      .subscribe();
  }

  ngOnInit(): void {
    this.logger.debug('Loading selected ids');
    this.store.dispatch(loadComicBookSelections());
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
