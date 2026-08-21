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
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import {
  selectDeletedPageList,
  selectDeletedPageListBusy
} from '@app/comic-pages/selectors/deleted-pages.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { DeletedPage } from '@app/comic-pages/models/deleted-page';
import { loadDeletedPages } from '@app/comic-pages/actions/deleted-pages.actions';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { ComicDetailListDialogComponent } from '@app/library/components/comic-detail-list-dialog/comic-detail-list-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { AsyncPipe } from '@angular/common';
import { PageHashUrlPipe } from '../../../comic-books/pipes/page-hash-url.pipe';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'cx-deleted-page-list-page',
  templateUrl: './deleted-page-list-page.component.html',
  styleUrls: ['./deleted-page-list-page.component.scss'],
  imports: [
    MatToolbar,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatSortHeader,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    AsyncPipe,
    TranslateModule,
    PageHashUrlPipe
  ]
})
export class DeletedPageListPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly displayedColumns = ['thumbnail', 'hash', 'comic-count'];
  dataSource = new MatTableDataSource<DeletedPage>([]);

  logger = inject(LoggerService);
  store = inject(Store);
  translationService = inject(TranslateService);
  titleService = inject(TitleService);
  activatedRoute = inject(ActivatedRoute);
  queryParameterService = inject(QueryParameterService);
  dialog = inject(MatDialog);

  constructor() {
    this.translationService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.store
      .select(selectDeletedPageListBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectDeletedPageList)
      .pipe(tap(pages => (this.pages = pages)))
      .subscribe();
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
