/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardFooter,
  MatCardTitle
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';

@Component({
  selector: 'cx-collection-list',
  imports: [
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatCardFooter,
    MatCardActions,
    MatIcon
  ],
  templateUrl: './collection-list.component.html',
  styleUrl: './collection-list.component.scss'
})
export class CollectionListComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  readonly displayedColumns = ['name', 'comic-count'];
  dataSource = new MatTableDataSource<RemoteLibrarySegmentState>([]);

  @Input() title: string;
  @Input() rows: number;

  @Output() closePanel = new EventEmitter();

  get data(): RemoteLibrarySegmentState[] {
    return this.dataSource.data;
  }

  @Input() set data(publishers: RemoteLibrarySegmentState[]) {
    this.dataSource.data = publishers;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'comic-count':
          return data.count;
        default:
          return data.name;
      }
    };
  }
}
