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
import { ActivatedRoute } from '@angular/router';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';

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

  langChangeSubscription: Subscription;
  comicListSubscription: Subscription;
  dataSource = new MatTableDataSource<DeletedPageListEntry>();

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private translationService: TranslateService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    public queryParameterService: QueryParameterService
  ) {
    this.langChangeSubscription =
      this.translationService.onLangChange.subscribe(() =>
        this.loadTranslations()
      );
    this.logger.trace('Subscribing to user changes');
    this.logger.trace('Subscribing to comic list changes');
    this.comicListSubscription = this.store
      .select(selectComicBookList)
      .subscribe(comics => {
        let pages: DeletedPageListEntry[] = [];
        // comics.forEach(comic =>
        //   comic.pages
        //     .filter(page => page.deleted)
        //     .forEach(page => pages.push({ comic, page }))
        // );
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
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    this.logger.trace('Loading tab label');
    this.titleService.setTitle(
      this.translationService.instant('deleted-page-list.tab-title')
    );
  }
}
