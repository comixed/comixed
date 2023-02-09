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
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  selectDeletedPageList,
  selectDeletedPagesState
} from '@app/comic-pages/selectors/deleted-pages.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { DeletedPage } from '@app/comic-pages/models/deleted-page';
import { loadDeletedPages } from '@app/comic-pages/actions/deleted-pages.actions';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { ComicDetailListDialogComponent } from '@app/library/components/comic-detail-list-dialog/comic-detail-list-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'cx-deleted-page-list-page',
  templateUrl: './deleted-page-list-page.component.html',
  styleUrls: ['./deleted-page-list-page.component.scss']
})
export class DeletedPageListPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly displayedColumns = ['thumbnail', 'hash', 'comic-count'];
  langChangeSubscription: Subscription;

  deletedPageStateSubscription: Subscription;
  deletedPageListSubscription: Subscription;
  dataSource = new MatTableDataSource<DeletedPage>([]);

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private translationService: TranslateService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    public queryParameterService: QueryParameterService,
    private dialog: MatDialog
  ) {
    this.langChangeSubscription =
      this.translationService.onLangChange.subscribe(() =>
        this.loadTranslations()
      );
    this.logger.trace('Subscribing to user changes');
    this.logger.trace('Subscribing to comic list changes');
    this.deletedPageStateSubscription = this.store
      .select(selectDeletedPagesState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.deletedPageListSubscription = this.store
      .select(selectDeletedPageList)
      .subscribe(pages => (this.pages = pages));
  }

  get pages(): DeletedPage[] {
    return this.dataSource.data;
  }

  set pages(pages: DeletedPage[]) {
    this.dataSource.data = pages;
  }

  get totalComicCount(): number {
    return this.pages
      .map(page => page.comics.length)
      .reduce((sum, current) => sum + current, 0);
  }

  ngAfterViewInit(): void {
    this.logger.trace('Assigning paginator');
    this.dataSource.paginator = this.paginator;
    this.logger.trace('Assigning table sort');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'hash':
          return data.hash;
        case 'comic-count':
          return data.comics.length;
      }
    };
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from deleted page state updates');
    this.deletedPageStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from delete page list updates');
    this.deletedPageListSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading deleted page list');
    this.store.dispatch(loadDeletedPages());
    this.loadTranslations();
  }

  onShowComics(comics: ComicDetail[]): void {
    this.dialog.open(ComicDetailListDialogComponent, { data: comics });
  }

  private loadTranslations(): void {
    this.logger.trace('Loading tab label');
    this.titleService.setTitle(
      this.translationService.instant('deleted-page-list.tab-title')
    );
  }
}
