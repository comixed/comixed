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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Comic, ComicFile } from 'app/library';

@Component({
  selector: 'app-comic-cover',
  templateUrl: './comic-cover.component.html',
  styleUrls: ['./comic-cover.component.scss']
})
export class ComicCoverComponent {
  @Input() cover_url: string;
  @Input() comic: Comic;
  @Input() comic_file: ComicFile;
  @Input() cover_size: number;
  @Input() same_height: boolean;
  @Input() selected = false;
  @Input() use_selected_class = true;

  @Output() click = new EventEmitter<Comic | ComicFile>();

  constructor() {}

  clicked(): void {
    if (this.comic) {
      this.click.emit(this.comic);
    } else {
      this.click.emit(this.comic_file);
    }
  }
}
