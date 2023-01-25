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
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Story } from '@app/lists/models/story';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  selectStories,
  selectStoryListState
} from '@app/lists/selectors/story-list.selectors';
import { ActivatedRoute } from '@angular/router';
import { loadStoriesForName } from '@app/lists/actions/story-list.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getPageSize } from '@app/user/user.functions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_OPTIONS } from '@app/core';

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
  langChangeSubscription: Subscription;
  storyStateSubscription: Subscription;
  storySubscription: Subscription;
  userSubscription: Subscription;
  pageSize = PAGE_SIZE_DEFAULT;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  readonly displayedColumns = [
    'story-name',
    'publisher',
    'entry-count',
    'actions'
  ];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private titleService: TitleService,
    public queryParameterService: QueryParameterService
  ) {
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.logger.trace('Loading story name from parameters');
      this.storyName = params.name;
      this.store.dispatch(loadStoriesForName({ name: this.storyName }));
    });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Loading user page size preference');
      this.pageSize = getPageSize(user);
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
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from display updates');
    this.userSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from story state updates');
    this.storyStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from story updates');
    this.storySubscription.unsubscribe();
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
