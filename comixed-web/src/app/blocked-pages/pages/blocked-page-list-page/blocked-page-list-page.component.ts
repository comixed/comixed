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

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { loadBlockedPageList } from '@app/blocked-pages/actions/blocked-page-list.actions';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { BlockedPage } from '@app/blocked-pages/blocked-pages.model';
import { selectBlockedPageList } from '@app/blocked-pages/selectors/blocked-page-list.selectors';
import { SelectableListItem } from '@app/core';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'cx-blocked-page-list',
  templateUrl: './blocked-page-list-page.component.html',
  styleUrls: ['./blocked-page-list-page.component.scss']
})
export class BlockedPageListPageComponent implements OnInit, AfterViewInit {
  @ViewChild('MatPagination') paginator: MatPaginator;

  pageSubscription: Subscription;
  dataSource = new MatTableDataSource<SelectableListItem<BlockedPage>>([]);
  readonly displayedColumns = [
    'selected',
    'label',
    'hash',
    'comic-count',
    'created-on'
  ];

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private router: Router
  ) {
    this.pageSubscription = this.store
      .select(selectBlockedPageList)
      .subscribe(entries => {
        const oldData = this.dataSource.data;
        this.dataSource.data = entries.map(item => {
          const selected =
            oldData.find(entry => entry.item.id === item.id)?.selected || false;
          return { selected, item };
        });
      });
  }

  ngOnInit(): void {
    this.store.dispatch(loadBlockedPageList());
  }

  onChangeSelection(
    entry: SelectableListItem<BlockedPage>,
    checked: boolean
  ): void {
    this.logger.debug('Changing selection to', checked);
    entry.selected = checked;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onOpenBlockedPageDetails(entry: SelectableListItem<BlockedPage>): void {
    this.logger.debug('Opening blocked page:', entry.item);
    this.router.navigate(['/admin', 'pages', 'blocked', entry.item.hash]);
  }
}
