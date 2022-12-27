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
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import {
  selectStoryListState,
  selectStoryNames
} from '@app/lists/selectors/story-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadStoryNames } from '@app/lists/actions/story-list.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { updateQueryParam } from '@app/core';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';
import { QUERY_PARAM_PAGE_SIZE } from '@app/app.constants';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getPageSize } from '@app/user/user.functions';

@Component({
  selector: 'cx-story-name-list-page',
  templateUrl: './story-name-list-page.component.html',
  styleUrls: ['./story-name-list-page.component.scss']
})
export class StoryNameListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<string>([]);
  storyListSubscription: Subscription;
  nameSubscription: Subscription;
  userSubscription: Subscription;
  queryParamSubscription: Subscription;
  pageSize = PAGE_SIZE_DEFAULT;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  langChangeSubscription: Subscription;

  readonly displayedColumns = ['story-name'];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
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
    this.storyListSubscription = this.store
      .select(selectStoryListState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loading }));
      });
    this.nameSubscription = this.store
      .select(selectStoryNames)
      .subscribe(names => (this.dataSource.data = names));
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Setting page size');
      this.pageSize = getPageSize(user);
    });
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.logger.trace('Loading all story names');
    this.store.dispatch(loadStoryNames());
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting table pagination');
    this.dataSource.paginator = this.paginator;
    this.logger.trace('Setting table sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'story-name':
          return data;
      }
    };
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from query parameters');
    this.queryParamSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from story list state changes');
    this.storyListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from name changse');
    this.nameSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
  }

  onPageChange(pageEvent: PageEvent): void {
    if (this.pageSize !== pageEvent.pageSize) {
      this.logger.trace('Page size changed');
      updateQueryParam(this.activatedRoute, this.router, [
        {
          name: QUERY_PARAM_PAGE_SIZE,
          value: `${pageEvent.pageSize}`
        }
      ]);
      this.logger.trace('Saving user preference');
      this.store.dispatch(
        saveUserPreference({
          name: PAGE_SIZE_PREFERENCE,
          value: `${pageEvent.pageSize}`
        })
      );
    }
  }

  private loadTranslations(): void {
    this.logger.trace('Loading tab title');
    this.titleService.setTitle(
      this.translateService.instant('story-list.tab-title')
    );
  }
}
