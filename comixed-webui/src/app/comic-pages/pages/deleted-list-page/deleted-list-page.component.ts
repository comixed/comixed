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
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { Subscription } from 'rxjs';
import { selectComicBookList } from '@app/comic-books/selectors/comic-book-list.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { DeletedPageListEntry } from '@app/comic-pages/models/ui/deleted-page-list-entry';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE,
  QUERY_PARAM_PAGE_INDEX
} from '@app/library/library.constants';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { ActivatedRoute } from '@angular/router';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { UrlParameterService } from '@app/core/services/url-parameter.service';

@Component({
  selector: 'cx-deleted-list-page',
  templateUrl: './deleted-list-page.component.html',
  styleUrls: ['./deleted-list-page.component.scss']
})
export class DeletedListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly displayedColumns = ['comic', 'filename', 'hash'];
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  queryParamSubscription: Subscription;
  pageIndex = 0;
  pageSize = PAGE_SIZE_DEFAULT;
  langChangeSubscription: Subscription;
  userSubscription: Subscription;
  comicListSubscription: Subscription;
  dataSource = new MatTableDataSource<DeletedPageListEntry>();
  ready = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private translationService: TranslateService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private urlParameterService: UrlParameterService
  ) {
    this.langChangeSubscription =
      this.translationService.onLangChange.subscribe(() =>
        this.loadTranslations()
      );
    this.logger.trace('Subscribing to query param changes');
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe(
      params => {
        if (!!params[QUERY_PARAM_PAGE_INDEX]) {
          this.pageIndex = +params[QUERY_PARAM_PAGE_INDEX];
          this.logger.debug(`Page index: ${this.pageIndex}`);
        }
      }
    );
    this.logger.trace('Subscribing to user changes');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.pageSize = parseInt(
        getUserPreference(
          user.preferences,
          PAGE_SIZE_PREFERENCE,
          `${this.pageSize}`
        ),
        10
      );
    });
    this.logger.trace('Subscribing to comic list changes');
    this.comicListSubscription = this.store
      .select(selectComicBookList)
      .subscribe(comics => {
        let pages: DeletedPageListEntry[] = [];
        comics.forEach(comic =>
          comic.pages
            .filter(page => page.deleted)
            .forEach(page => pages.push({ comic, page }))
        );
        this.dataSource.data = pages;
      });
  }

  ngAfterViewInit(): void {
    this.logger.trace('Assigning paginator');
    this.dataSource.paginator = this.paginator;
    this.logger.trace('Assigning table sort');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'comic':
          return data.comic.coverDate;
        case 'filename':
          return data.page.filename;
        case 'hash':
          return data.page.hash;
      }
    };
    this.ready = true;
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from query param updates');
    this.queryParamSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  onPageChange(
    pageSize: number,
    pageIndex: number,
    previousPageIndex: number
  ): void {
    this.logger.trace('Page size changed');
    this.store.dispatch(
      saveUserPreference({
        name: PAGE_SIZE_PREFERENCE,
        value: `${pageSize}`
      })
    );
    if (pageIndex !== previousPageIndex) {
      this.logger.debug('Page index changed:', pageIndex);
      this.urlParameterService.updateQueryParam([
        {
          name: QUERY_PARAM_PAGE_INDEX,
          value: `${pageIndex}`
        }
      ]);
    }
  }

  private loadTranslations(): void {
    this.logger.trace('Loading tab label');
    this.titleService.setTitle(
      this.translationService.instant('deleted-page-list.tab-title')
    );
  }
}
