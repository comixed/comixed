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

import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { Comic } from '@app/comic-book/models/comic';
import { LastRead } from '@app/last-read/models/last-read';
import { ComicBookState } from '@app/comic-book/models/comic-book-state';

@Component({
  selector: 'cx-comic-overview',
  templateUrl: './comic-overview.component.html',
  styleUrls: ['./comic-overview.component.scss']
})
export class ComicOverviewComponent implements OnInit {
  @Input() comic: Comic;
  @Input() lastRead: LastRead;
  @Input() isAdmin = false;

  readonly labelClasses = [
    'cx-detail-label',
    'cx-float-left',
    'cx-align-text-right',
    'cx-padding-right-5'
  ];
  readonly valueClasses = [];

  constructor(private logger: LoggerService) {}

  get comicChanged(): boolean {
    return !!this.comic && this.comic.comicState === ComicBookState.CHANGED;
  }

  ngOnInit(): void {}
}
