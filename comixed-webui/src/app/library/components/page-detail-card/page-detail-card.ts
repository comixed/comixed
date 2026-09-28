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

import { Component, Input } from '@angular/core';
import { ComicPageUrlPipe } from '@app/library/pipes/comic-page-url-pipe';
import { Card } from '@openng/optimus-ui/card';
import { ComicPage } from '@app/library/models/comic-page';

@Component({
  imports: [ComicPageUrlPipe, Card],
  selector: 'app-page-detail-card',
  styleUrl: './page-detail-card.scss',
  templateUrl: './page-detail-card.html'
})
export class PageDetailCard {
  @Input() page!: ComicPage;
}
