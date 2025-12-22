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

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicPageComponent } from '@app/comic-books/components/comic-page/comic-page.component';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ComicState } from '@app/comic-books/models/comic-state';
import { MatIconButton } from '@angular/material/button';
import { Store } from '@ngrx/store';
import {
  deleteSingleComicBook,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import { Router } from '@angular/router';
import { LoggerService } from '@angular-ru/cdk/logger';

@Component({
  selector: 'cx-comic-grid-item',
  imports: [
    ComicPageComponent,
    ComicCoverUrlPipe,
    MatCard,
    MatCardContent,
    MatCardTitle,
    ComicTitlePipe,
    MatTooltip,
    TranslatePipe,
    DatePipe,
    MatCardActions,
    MatIcon,
    MatIconButton,
    MatCardSubtitle
  ],
  templateUrl: './comic-grid-item.component.html',
  styleUrl: './comic-grid-item.component.scss'
})
export class ComicGridItemComponent {
  @Input() comic: DisplayableComic;
  @Input() selected = false;

  @Output() comicClicked = new EventEmitter<DisplayableComic>();

  logger = inject(LoggerService);
  store = inject(Store);
  router = inject(Router);

  onDeleteComic(): void {
    this.logger.info('Marking comic for deletion:', this.comic);
    this.store.dispatch(
      deleteSingleComicBook({ comicBookId: this.comic.comicBookId })
    );
  }

  onUndeleteComic(): void {
    this.logger.info('Unmarking comic for deletion:', this.comic);
    this.store.dispatch(
      undeleteSingleComicBook({ comicBookId: this.comic.comicBookId })
    );
  }

  onOpenComic(): void {
    this.logger.info('Opening comic book:', this.comic);
    this.router.navigate(['/comics', this.comic.comicBookId]);
  }

  isDeleted(comic: DisplayableComic): boolean {
    return comic.comicState === ComicState.DELETED;
  }
}
