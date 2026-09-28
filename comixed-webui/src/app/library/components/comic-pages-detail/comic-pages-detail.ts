/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, Input, signal } from '@angular/core';
import { ComicPage } from '@app/library/models/comic-page';
import { FormsModule } from '@angular/forms';
import { Comic, NO_COMIC } from '@app/library/models/comic';
import { Carousel } from '@openng/optimus-ui/carousel';
import { PageDetailCard } from '@app/library/components/page-detail-card/page-detail-card';

@Component({
  imports: [FormsModule, Carousel, PageDetailCard],
  selector: 'app-comic-pages-detail',
  styleUrl: './comic-pages-detail.scss',
  templateUrl: './comic-pages-detail.html'
})
export class ComicPagesDetail {
  readonly isLoading = signal(false);
  readonly comicDetail = signal<Comic>(NO_COMIC);
  readonly comicPages = signal<ComicPage[]>([]);

  @Input() set loading(loading: boolean) {
    this.isLoading.set(loading);
  }

  @Input() set comic(comic: Comic) {
    this.comicDetail.set(comic);
  }

  @Input() set pages(pages: ComicPage[]) {
    this.comicPages.set(pages);
  }
}
