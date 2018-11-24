/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { ComicService } from '../../../../services/comic.service';
import { ComicFile } from '../../../../models/import/comic-file';

@Component({
  selector: 'app-selected-comics',
  templateUrl: './selected-comics.component.html',
  styleUrls: ['./selected-comics.component.css']
})
export class SelectedComicsComponent implements OnInit {
  @Input() selected_files: Array<ComicFile>;
  @Input() show_selected_files: boolean;
  @Input() cover_width: string;
  @Input() cover_height: string;

  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();

  protected rows_options: Array<SelectItem>;
  rows = 10;

  constructor(
    private comic_service: ComicService,
  ) {
    this.rows_options = [
      { label: '10 comics', value: 10 },
      { label: '25 comics', value: 25 },
      { label: '50 comics', value: 50 },
      { label: '100 comics', value: 100 },
    ];

  }

  ngOnInit() {
  }

  hide_panel(): void {
    this.close.next(true);
  }

  get_cover_url(file: ComicFile): string {
    return this.comic_service.get_cover_url_for_file(file.filename);
  }

  set_selected(file: ComicFile, selected: boolean): void {
    file.selected = selected;
    if (selected) {
      this.selected_files.push(file);
    } else {
      this.selected_files = this.selected_files.filter((file_detail: ComicFile) => {
        return file_detail.filename !== file.filename;
      });
    }
  }

  set_rows(rows: number): void {
    this.rows = rows;
  }
}
