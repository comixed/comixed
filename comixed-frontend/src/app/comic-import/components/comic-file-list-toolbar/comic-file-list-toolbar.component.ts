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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/library';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { ComicImportAdaptor } from 'app/comic-import/adaptors/comic-import.adaptor';

@Component({
  selector: 'app-comic-file-list-toolbar',
  templateUrl: './comic-file-list-toolbar.component.html',
  styleUrls: ['./comic-file-list-toolbar.component.scss']
})
export class ComicFileListToolbarComponent implements OnInit {
  @Input() busy: boolean;
  @Input() directory: string;
  @Input() comic_files: Array<ComicFile> = [];
  @Input() selected_comic_count = 0;

  @Output() changeLayout = new EventEmitter<string>();
  @Output() showSelections = new EventEmitter<boolean>();
  @Output() filterText = new EventEmitter<string>();

  layout_options: Array<SelectItem>;
  sort_field_options: Array<SelectItem>;
  rows_options: Array<SelectItem>;

  layout: string;
  sort_field: string;
  rows: number;
  same_height: boolean;
  cover_size: number;
  deleteBlockedPages = false;

  constructor(
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private comicImportAdaptor: ComicImportAdaptor,
    private store: Store<AppState>,
    private translateService: TranslateService
  ) {
    this.load_layout_options();
    this.load_sort_field_options();
    this.load_rows_options();
    this.layout = this.libraryDisplayAdaptor.getLayout();
    this.sort_field = this.libraryDisplayAdaptor.getSortField();
    this.rows = this.libraryDisplayAdaptor.getDisplayRows();
    this.same_height = this.libraryDisplayAdaptor.getSameHeight();
    this.cover_size = this.libraryDisplayAdaptor.getCoverSize();
  }

  ngOnInit() {}

  find_comics(): void {
    this.authenticationAdaptor.setPreference(
      'import.directory',
      this.directory
    );
    this.comicImportAdaptor.getComicFiles(this.directory);
  }

  select_all_comics(): void {
    this.comicImportAdaptor.selectComicFiles(this.comic_files);
  }

  deselect_all_comics(): void {
    this.comicImportAdaptor.deselectComicFiles(this.comic_files);
  }

  set_sort_field(sort_field: string): void {
    this.sort_field = sort_field;
    this.libraryDisplayAdaptor.setSortField(sort_field, false);
  }

  set_rows(rows: number): void {
    this.rows = rows;
    this.libraryDisplayAdaptor.setDisplayRows(rows);
  }

  set_same_height(same_height: boolean): void {
    this.same_height = same_height;
    this.libraryDisplayAdaptor.setSameHeight(same_height);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
    this.libraryDisplayAdaptor.setCoverSize(cover_size, false);
  }

  save_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
    this.libraryDisplayAdaptor.setCoverSize(cover_size);
  }

  private load_layout_options(): void {
    this.layout_options = [
      {
        label: this.translateService.instant(
          'library-contents.options.layout.grid-layout'
        ),
        value: 'grid'
      },
      {
        label: this.translateService.instant(
          'library-contents.options.layout.list-layout'
        ),
        value: 'list'
      }
    ];
  }

  private load_sort_field_options(): void {
    this.sort_field_options = [
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.sort-field.filename'
        ),
        value: 'filename'
      },
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.sort-field.size'
        ),
        value: 'size'
      }
    ];
  }

  private load_rows_options(): void {
    this.rows_options = [
      {
        label: this.translateService.instant(
          'library-contents.options.rows.10-per-page'
        ),
        value: 10
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.25-per-page'
        ),
        value: 25
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.50-per-page'
        ),
        value: 50
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.100-per-page'
        ),
        value: 100
      }
    ];
  }

  toggleBlockedPages() {
    this.deleteBlockedPages = !this.deleteBlockedPages;
  }
}
