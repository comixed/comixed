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
import { LoggerService } from '@angular-ru/logger';
import { PageClickEvent } from '@app/core';

/** Displays a page from a comic. Provides events for when the page is clicked. */
@Component({
  selector: 'cx-comic-page',
  templateUrl: './comic-page.component.html',
  styleUrls: ['./comic-page.component.scss']
})
export class ComicPageComponent {
  @Input() imageTitle: string;
  @Input() source: any;
  @Input() imageUrl: string;
  @Input() selected: boolean;
  @Input() pageSize = -1;
  @Input() imageHeight = 'auto';

  @Output() pageClicked = new EventEmitter<PageClickEvent>();

  constructor(private logger: LoggerService) {}

  get imageWidth(): string {
    return this.pageSize === -1 ? 'auto' : `${this.pageSize}px`;
  }

  /** Invoked when the page is clicked. */
  onClick(): void {
    this.logger.trace('Page clicked:', this.source, this.selected);
    this.pageClicked.emit({
      source: this.source,
      selected: !this.selected
    } as PageClickEvent);
  }
}
