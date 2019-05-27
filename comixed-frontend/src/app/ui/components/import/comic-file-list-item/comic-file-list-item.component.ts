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

import { Component, Input, OnInit } from '@angular/core';
import { ComicFile } from 'app/models/import/comic-file';
import * as ImportActions from 'app/actions/importing.actions';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';

@Component({
  selector: 'app-comic-file-list-item',
  templateUrl: './comic-file-list-item.component.html',
  styleUrls: ['./comic-file-list-item.component.css']
})
export class ComicFileListItemComponent implements OnInit {
  @Input() comic_file: ComicFile;
  @Input() cover_size: number;
  @Input() same_height: boolean;
  @Input() use_selected_class: boolean;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {}

  toggle_selected(select: boolean): void {
    if (select) {
      this.store.dispatch(
        new ImportActions.ImportingSelectFiles({ files: [this.comic_file] })
      );
    } else {
      this.store.dispatch(
        new ImportActions.ImportingUnselectFiles({ files: [this.comic_file] })
      );
    }
  }
}
