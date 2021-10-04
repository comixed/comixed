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

import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Story } from '@app/lists/models/story';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  selectStories,
  selectStoryListState
} from '@app/lists/selectors/story-list.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStoriesForName } from '@app/lists/actions/story-list.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { PAGINATION_DEFAULT } from '@app/library/library.constants';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { updateQueryParam } from '@app/core';
import { QUERY_PARAM_PAGE_SIZE } from '@app/app.constants';
import { setPagination } from '@app/library/actions/display.actions';
import { selectDisplayState } from '@app/library/selectors/display.selectors';

@Component({
  selector: 'cx-story-list-for-name-page',
  templateUrl: './story-list-for-name-page.component.html',
  styleUrls: ['./story-list-for-name-page.component.scss']
})
export class StoryListForNamePageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<Story>([]);
  paramSubscription: Subscription;
  storyName = '';
  queryParamSubscription: Subscription;
  langChangeSubscription: Subscription;
  storyStateSubscription: Subscription;
  storySubscription: Subscription;
  displaySubscription: Subscription;
  pageSize = PAGINATION_DEFAULT;

  readonly displayedColumns = [
    'story-name',
    'publisher',
    'entry-count',
    'actions'
  ];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.logger.trace('Loading story name from parameters');
      this.storyName = params.name;
      this.store.dispatch(loadStoriesForName({ name: this.storyName }));
    });
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        if (+params[QUERY_PARAM_PAGE_SIZE]) {
          this.pageSize = +params[QUERY_PARAM_PAGE_SIZE];
        }
      }
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.displaySubscription = this.store
      .select(selectDisplayState)
      .subscribe(state => {
        if (state.pagination !== this.pageSize) {
          this.pageSize = state.pagination;
        }
      });
    this.storyStateSubscription = this.store
      .select(selectStoryListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
      });
    this.storySubscription = this.store
      .select(selectStories)
      .subscribe(stories => (this.dataSource.data = stories));
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up pagination');
    this.dataSource.paginator = this.paginator;
    this.logger.trace('Setting up sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'story-name':
          return data.name;
        case 'publisher':
          return data.publisher;
        case 'entry-count':
          return data.entries.length;
      }
    };
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from parameter updates');
    this.paramSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from query parameter updates');
    this.queryParamSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from display updates');
    this.displaySubscription.unsubscribe();
    this.logger.trace('Unsubscribing from story state updates');
    this.storyStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from story updates');
    this.storySubscription.unsubscribe();
  }

  onPageChange(pageEvent: PageEvent): void {
    if (pageEvent.pageSize !== this.pageSize) {
      updateQueryParam(
        this.activatedRoute,
        this.router,
        QUERY_PARAM_PAGE_SIZE,
        `${pageEvent.pageSize}`
      );
      this.store.dispatch(setPagination({ pagination: pageEvent.pageSize }));
    }
  }

  private loadTranslations(): void {
    this.logger.trace('Loading tab title');
    this.titleService.setTitle(
      this.translateService.instant('story-list-for-name.tab-title', {
        name: this.storyName
      })
    );
  }
}
