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

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MatDialog } from '@angular/material/dialog';
import { ComicDetailsDialogComponent } from '@app/library/components/comic-details-dialog/comic-details-dialog.component';
import { MatCard, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';

@Component({
  selector: 'app-selected-comics',
  templateUrl: './selected-comics.component.html',
  styleUrls: ['./selected-comics.component.scss'],
  imports: [
    MatCard,
    MatCardTitle,
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatCardSubtitle,
    ComicTitlePipe,
    TranslateModule
  ]
})
export class SelectedComicsComponent {
  @Output() selectionChanged = new EventEmitter<DisplayableComic>();

  logger = inject(LoggerService);
  dialog = inject(MatDialog);

  private _comics: DisplayableComic[] = [];

  get comics(): DisplayableComic[] {
    return this._comics;
  }

  @Input() set comics(comics: DisplayableComic[]) {
    this._comics = comics;
    if (comics.length > 0) {
      this.selectionChanged.emit(this._comics[0]);
    }
  }

  onSelectionChanged(comic: DisplayableComic): void {
    this.logger.debug('Selected comic change:', comic);
    this.selectionChanged.emit(comic);
  }

  onShowComicDetails(comic: DisplayableComic, $event: MouseEvent): void {
    this.logger.debug('Showing details dialog:', comic);
    this.dialog.open(ComicDetailsDialogComponent, {
      data: comic
    });
    $event.stopPropagation();
  }
}
