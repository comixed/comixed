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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { MatDialog } from '@angular/material/dialog';
import { ComicDetailsDialogComponent } from '@app/comic/components/comic-details-dialog/comic-details-dialog.component';
import { Comic } from '@app/comic/models/comic';

@Component({
  selector: 'cx-selected-comics',
  templateUrl: './selected-comics.component.html',
  styleUrls: ['./selected-comics.component.scss']
})
export class SelectedComicsComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<Comic>();

  constructor(private logger: LoggerService, public dialog: MatDialog) {}

  private _comics: Comic[] = [];

  get comics(): Comic[] {
    return this._comics;
  }

  @Input() set comics(comics: Comic[]) {
    this._comics = comics;
    if (comics.length > 0) {
      this.selectionChanged.emit(this._comics[0]);
    }
  }

  ngOnInit(): void {}

  onSelectionChanged(comic: Comic): void {
    this.logger.debug('Selected comic change:', comic);
    this.selectionChanged.emit(comic);
  }

  onShowComicDetails(comic: Comic, $event: MouseEvent): void {
    this.logger.debug('Showing details dialog:', comic);
    this.dialog.open(ComicDetailsDialogComponent, {
      data: comic
    });
    $event.stopPropagation();
  }
}
