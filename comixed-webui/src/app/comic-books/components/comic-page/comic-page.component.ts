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

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicPage } from '@app/comic-books/models/comic-page';
import { PageContextMenuEvent } from '@app/comic-books/models/event/page-context-menu-event';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

/** Displays a page from a comic. Provides events for when the page is clicked. */
@Component({
  selector: 'cx-comic-page',
  templateUrl: './comic-page.component.html',
  styleUrls: ['./comic-page.component.scss'],
  imports: [MatCardModule, MatIconModule, MatTooltipModule, TranslateModule]
})
export class ComicPageComponent {
  @Input() page: ComicPage;
  @Input() imageUrl: string;
  @Input() selected: boolean;
  @Input() title: string;

  @Output() showContextMenu = new EventEmitter<PageContextMenuEvent>();

  logger = inject(LoggerService);

  onContextMenu($event: MouseEvent): void {
    $event.preventDefault();
    this.logger.debug('Showing context menu for page:', this.page);
    this.showContextMenu.emit({
      page: this.page,
      x: `${$event.clientX}px`,
      y: `${$event.clientY}px`
    } as PageContextMenuEvent);
  }
}
