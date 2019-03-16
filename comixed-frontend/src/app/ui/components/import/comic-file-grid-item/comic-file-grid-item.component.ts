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
import { ComicFile } from '../../../../models/import/comic-file';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import * as ImportActions from '../../../../actions/importing.actions';

@Component({
  selector: 'app-comic-file-grid-item',
  templateUrl: './comic-file-grid-item.component.html',
  styleUrls: ['./comic-file-grid-item.component.css']
})
export class ComicFileGridItemComponent implements OnInit {
  @Input() comic_file: ComicFile;
  @Input() cover_size: number;
  @Input() same_height: boolean;
  @Input() use_selected_class: boolean;

  constructor(
    private store: Store<AppState>
  ) {
  }

  ngOnInit() {
  }

  toggle_selected(select: boolean): void {
    if (select) {
      this.store.dispatch(new ImportActions.ImportingSelectFiles({ files: [this.comic_file] }));
    } else {
      this.store.dispatch(new ImportActions.ImportingUnselectFiles({ files: [this.comic_file] }));
    }
  }
}
