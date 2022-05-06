/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ComicContextMenuEvent } from '@app/comic-books/models/event/comic-context-menu-event';
import { ComicSelectEvent } from '@app/comic-books/models/event/comic-select-event';
import { UpdateComicInfoEvent } from '@app/comic-books/models/event/update-comic-info-event';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';

@Component({
  selector: 'cx-comic-detail-card',
  templateUrl: './comic-detail-card.component.html',
  styleUrls: ['./comic-detail-card.component.scss']
})
export class ComicDetailCardComponent {
  @Input() comic: ComicBook;
  @Input() coverTooltip: string;
  @Input() title: string;
  @Input() subtitle: string = '';
  @Input() imageUrl: string;
  @Input() description: string;
  @Input() detailLink: string;
  @Input() busy = false;
  @Input() blurred = false;
  @Input() selected = false;
  @Input() comicChanged = false;
  @Input() isAdmin = false;
  @Input() showActions = true;
  @Input() isRead = false;

  @Output() selectionChanged = new EventEmitter<ComicSelectEvent>();
  @Output() showContextMenu = new EventEmitter<ComicContextMenuEvent>();
  @Output() updateComicInfo = new EventEmitter<UpdateComicInfoEvent>();

  constructor(private logger: LoggerService) {}

  get deleted(): boolean {
    return this.comic?.comicState === ComicBookState.DELETED;
  }

  onCoverClicked(): void {
    // only respond to the click if the details are for a comic
    if (!!this.comic) {
      this.logger.trace('ComicBook cover clicked');
      this.selectionChanged.emit({
        comic: this.comic,
        selected: !this.selected
      });
    }
  }

  onContextMenu(mouseEvent: MouseEvent): void {
    mouseEvent.preventDefault();
    this.logger.trace('Showing context menu for comic:', this.comic);
    this.showContextMenu.emit({
      comic: this.comic,
      x: `${mouseEvent.clientX}px`,
      y: `${mouseEvent.clientY}px`
    });
  }

  onUpdateComicInfo(comic: ComicBook): void {
    this.logger.trace('Firing update comic info event:', comic);
    this.updateComicInfo.emit({ comic });
  }
}
