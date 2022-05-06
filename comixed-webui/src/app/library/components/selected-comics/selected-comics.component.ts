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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MatDialog } from '@angular/material/dialog';
import { ComicDetailsDialogComponent } from '@app/library/components/comic-details-dialog/comic-details-dialog.component';

@Component({
  selector: 'cx-selected-comics',
  templateUrl: './selected-comics.component.html',
  styleUrls: ['./selected-comics.component.scss']
})
export class SelectedComicsComponent {
  @Output() selectionChanged = new EventEmitter<ComicBook>();

  constructor(private logger: LoggerService, public dialog: MatDialog) {}

  private _comics: ComicBook[] = [];

  get comics(): ComicBook[] {
    return this._comics;
  }

  @Input() set comics(comics: ComicBook[]) {
    this._comics = comics;
    if (comics.length > 0) {
      this.selectionChanged.emit(this._comics[0]);
    }
  }

  onSelectionChanged(comic: ComicBook): void {
    this.logger.debug('Selected comic change:', comic);
    this.selectionChanged.emit(comic);
  }

  onShowComicDetails(comic: ComicBook, $event: MouseEvent): void {
    this.logger.debug('Showing details dialog:', comic);
    this.dialog.open(ComicDetailsDialogComponent, {
      data: comic
    });
    $event.stopPropagation();
  }
}
