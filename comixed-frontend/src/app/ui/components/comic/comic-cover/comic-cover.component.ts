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

import { Component, Input } from '@angular/core';
import { Comic, ComicFile, ImportAdaptor, SelectionAdaptor } from 'app/library';

@Component({
  selector: 'app-comic-cover',
  templateUrl: './comic-cover.component.html',
  styleUrls: ['./comic-cover.component.scss']
})
export class ComicCoverComponent {
  @Input() cover_url: string;
  @Input() title: string;
  @Input() comic: Comic;
  @Input() comic_file: ComicFile;
  @Input() cover_size: number;
  @Input() same_height: boolean;
  @Input() selected = false;
  @Input() use_selected_class = true;

  constructor(
    private import_adaptor: ImportAdaptor,
    private selection_adaptor: SelectionAdaptor
  ) {}

  toggle_selection(): void {
    if (this.selected) {
      if (this.comic) {
        this.selection_adaptor.deselect_comic(this.comic);
      } else {
        this.import_adaptor.deselect_comic_files([this.comic_file]);
      }
    } else {
      if (this.comic) {
        this.selection_adaptor.select_comic(this.comic);
      } else {
        this.import_adaptor.select_comic_files([this.comic_file]);
      }
    }
  }
}
