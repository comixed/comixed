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

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import * as LibraryActions from '../../../../actions/library.actions';
import { Comic } from '../../../../models/comics/comic';
import { ScanType } from '../../../../models/comics/scan-type';
import { Library } from '../../../../models/library';
import { ComicService } from '../../../../services/comic.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-library-covers',
  templateUrl: './library-covers.component.html',
  styleUrls: ['./library-covers.component.css']
})
export class LibraryCoversComponent implements OnInit {
  @Input() is_admin: boolean;
  @Input() library: Library;
  @Input() rows: number;
  @Input() sort_by: string;
  @Input() cover_size: number;
  @Input() sort_options: Array<SelectItem>;
  @Input() rows_options: Array<SelectItem>;
  @Output() changeSort = new EventEmitter<string>();
  @Output() changeRows = new EventEmitter<number>();
  @Output() changeCoverSize = new EventEmitter<number>();
  @Output() saveCoverSize = new EventEmitter<number>();
  @Output() comicSelected = new EventEmitter<Comic>();
  @Output() open = new EventEmitter<Comic>();
  @Output() delete = new EventEmitter<Comic>();

  public scan_types: Array<SelectItem>;

  constructor(
    private comic_service: ComicService,
    private store: Store<AppState>,
  ) { }

  ngOnInit() {
    this.scan_types = [];
    this.library.scan_types.forEach((scan_type: ScanType) => {
      this.scan_types.push({
        label: scan_type.name,
        value: scan_type,
      });
    });
  }

  set_sort_order(sort_order: string): void {
    this.changeSort.next(sort_order);
  }

  set_rows(rows: number): void {
    this.changeRows.next(rows);
  }

  get_cover_url(comic: Comic): string {
    return this.comic_service.get_cover_url_for_comic(comic);
  }

  get_download_link(comic: Comic): string {
    return this.comic_service.get_download_link_for_comic(comic.id);
  }

  set_selected_comic(event: Event, comic: Comic): void {
    this.comicSelected.next(comic);
    event.preventDefault();
  }

  open_comic(comic: Comic): void {
    this.open.next(comic);
  }

  delete_comic(comic: Comic): void {
    this.delete.next(comic);
  }

  set_scan_type(comic: Comic, scan_type: ScanType): void {
    this.store.dispatch(new LibraryActions.LibrarySetScanType({
      comic: comic,
      scan_type: scan_type,
    }));
  }

  set_comic_format(comic: Comic, format: ComicFormat): void {
    this.store.dispatch(new LibraryActions.LibrarySetFormat({
      comic: comic,
      format: format,
    }));
  }
}
