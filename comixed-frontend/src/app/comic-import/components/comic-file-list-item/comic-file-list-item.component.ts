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
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { ComicFile } from 'app/comic-import/models/comic-file';

@Component({
  selector: 'app-comic-file-list-item',
  templateUrl: './comic-file-list-item.component.html',
  styleUrls: ['./comic-file-list-item.component.scss']
})
export class ComicFileListItemComponent {
  @Input() comic_file: ComicFile;
  @Input() cover_size: number;
  @Input() same_height: boolean;
  @Input() use_selected_class: boolean;
  @Input() selected: boolean;

  @Output() click = new EventEmitter<ComicFile>();

  constructor(private store: Store<AppState>) {}
}
