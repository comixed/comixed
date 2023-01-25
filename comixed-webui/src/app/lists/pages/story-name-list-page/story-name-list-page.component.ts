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
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import {
  selectStoryListState,
  selectStoryNames
} from '@app/lists/selectors/story-list.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { loadStoryNames } from '@app/lists/actions/story-list.actions';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';

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
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  langChangeSubscription: Subscription;

  readonly displayedColumns = ['story-name'];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private translateService: TranslateService,
    private titleService: TitleService,
    public queryParameterService: QueryParameterService
  ) {
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
    this.logger.trace('Unsubscribing from story list state changes');
    this.storyListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from name changse');
    this.nameSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.logger.trace('Loading tab title');
    this.titleService.setTitle(
      this.translateService.instant('story-list.tab-title')
    );
  }
}
