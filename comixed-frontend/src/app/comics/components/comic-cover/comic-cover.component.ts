/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { ComicFile } from 'app/comic-import/models/comic-file';
import { Comic } from 'app/comics';
import { DuplicatePage } from 'app/library/models/duplicate-page';
import { ComicCoverClickEvent } from 'app/comics/models/event/comic-cover-click-event';

@Component({
  selector: 'app-comic-cover',
  templateUrl: './comic-cover.component.html',
  styleUrls: ['./comic-cover.component.scss']
})
export class ComicCoverComponent {
  @Input() coverUrl: string;
  @Input() comic: Comic;
  @Input() comicFile: ComicFile;
  @Input() duplicatePage: DuplicatePage;
  @Input() coverSize: number;
  @Input() useSameHeight: boolean;
  @Input() selected = false;
  @Input() selectSelectedClass = true;
  @Input() unprocessed = false;

  @Output() click = new EventEmitter<ComicCoverClickEvent>();

  constructor() {}

  clicked(): void {
    this.click.emit({
      selected: !this.selected,
      comic: this.comic,
      comicFile: this.comicFile,
      duplicatePage: this.duplicatePage
    });
  }

  showOverlay(): boolean {
    return this.unprocessed || (!!this.comic && !!this.comic.deletedDate);
  }
}
