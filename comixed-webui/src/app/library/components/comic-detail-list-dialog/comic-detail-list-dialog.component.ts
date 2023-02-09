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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { MatTableDataSource } from '@angular/material/table';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';

@Component({
  selector: 'cx-comics-with-duplicate-page',
  templateUrl: './comic-detail-list-dialog.component.html',
  styleUrls: ['./comic-detail-list-dialog.component.scss']
})
export class ComicDetailListDialogComponent {
  dataSource = new MatTableDataSource<SelectableListItem<ComicDetail>>([]);

  constructor(
    private logger: LoggerService,
    @Inject(MAT_DIALOG_DATA) public _comics: ComicDetail[]
  ) {
    this.comics = _comics;
  }

  get comics(): ComicDetail[] {
    return this.dataSource.data.map(entry => entry.item);
  }

  set comics(comics: ComicDetail[]) {
    this.dataSource.data = comics.map(comic => {
      return { item: comic, selected: false };
    });
  }
}
