/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { LoggerService } from '@angular-ru/cdk/logger';

@Component({
  selector: 'cx-comic-book-list',
  templateUrl: './comic-book-list.component.html',
  styleUrls: ['./comic-book-list.component.scss']
})
export class ComicBookListComponent {
  @Input()
  dataSource: MatTableDataSource<ComicBook>;

  readonly displayedColumns = [
    'publisher',
    'series',
    'volume',
    'issue-number',
    'cover-date',
    'store-date'
  ];

  constructor(private logger: LoggerService) {}
}
