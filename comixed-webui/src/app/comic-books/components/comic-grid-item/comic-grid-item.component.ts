/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicPageComponent } from '@app/comic-books/components/comic-page/comic-page.component';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardTitle
} from '@angular/material/card';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'cx-comic-grid-item',
  imports: [
    ComicPageComponent,
    ComicCoverUrlPipe,
    MatCard,
    MatCardContent,
    MatCardTitle,
    ComicTitlePipe,
    MatCardFooter,
    MatTooltip,
    TranslatePipe,
    DatePipe
  ],
  templateUrl: './comic-grid-item.component.html',
  styleUrl: './comic-grid-item.component.scss'
})
export class ComicGridItemComponent {
  @Input() comic: DisplayableComic;
  @Input() selected = false;

  @Output() comicClicked = new EventEmitter<DisplayableComic>();
}
