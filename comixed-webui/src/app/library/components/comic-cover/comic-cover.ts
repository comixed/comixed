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
import { Comic, NO_COMIC } from '@app/library/models/comic';
import { ComicCoverUrlPipe } from '@app/library/pipes/comic-cover-url-pipe';
import { Card } from '@openng/optimus-ui/card';
import { ComicTitlePipe } from '@app/library/pipes/comic-title-pipe';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Button } from '@openng/optimus-ui/button';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { Skeleton } from '@openng/optimus-ui/skeleton';

@Component({
  imports: [
    ComicCoverUrlPipe,
    Card,
    ComicTitlePipe,
    Tooltip,
    Button,
    TranslatePipe,
    RouterLink,
    Skeleton
  ],
  selector: 'app-comic-cover',
  styleUrl: './comic-cover.scss',
  templateUrl: './comic-cover.html'
})
export class ComicCover {
  readonly isLoading = signal(false);
  readonly comicDetail = signal<Comic>(NO_COMIC);

  @Input() set comic(comic: Comic) {
    this.comicDetail.set(comic);
  }

  @Input() set loading(loading: boolean) {
    this.isLoading.set(loading);
  }
}
