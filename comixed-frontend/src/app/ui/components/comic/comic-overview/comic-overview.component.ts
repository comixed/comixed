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

import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as LibraryActions from 'app/actions/library.actions';
import { LibraryState } from 'app/models/state/library-state';
import { Comic } from 'app/models/comics/comic';
import { LastReadDate } from 'app/models/comics/last-read-date';
import { ScanType } from 'app/models/comics/scan-type';
import { ComicFormat } from 'app/models/comics/comic-format';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comic-overview',
  templateUrl: './comic-overview.component.html',
  styleUrls: ['./comic-overview.component.css']
})
export class ComicOverviewComponent implements OnInit {
  @Input() is_admin: boolean;
  @Input() comic: Comic;
  @Input() library: LibraryState;

  public scan_types: Array<SelectItem>;
  public formats: Array<SelectItem>;

  public scan_type: ScanType;
  public format: ComicFormat;
  public sort_name: string;

  constructor(
    private store: Store<AppState>,
    private confirm_service: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.format = this.comic.format;
    this.scan_type = this.comic.scan_type;
    this.scan_types = [
      {
        label: 'Select one...',
        value: null
      }
    ];
    this.library.scan_types.forEach((scan_type: ScanType) => {
      this.scan_types.push({
        label: scan_type.name,
        value: scan_type
      });
    });
    this.formats = [
      {
        label: 'Select one...',
        value: null
      }
    ];
    this.library.formats.forEach((format: ComicFormat) => {
      this.formats.push({
        label: format.name,
        value: format
      });
    });
  }

  copy_comic_format(comic: Comic): void {
    this.format = comic.format;
  }

  set_comic_format(comic: Comic, format: ComicFormat): void {
    if (format) {
      this.store.dispatch(
        new LibraryActions.LibrarySetFormat({
          comic: comic,
          format: format
        })
      );
    }
  }

  copy_scan_type(comic: Comic): void {
    this.scan_type = comic.scan_type;
  }

  set_scan_type(comic: Comic, scan_type: ScanType): void {
    if (scan_type) {
      this.store.dispatch(
        new LibraryActions.LibrarySetScanType({
          comic: comic,
          scan_type: scan_type
        })
      );
    }
  }

  copy_sort_name(comic: Comic): void {
    this.sort_name = comic.sort_name || '';
  }

  save_sort_name(comic: Comic): void {
    this.store.dispatch(
      new LibraryActions.LibrarySetSortName({
        comic: comic,
        sort_name: this.sort_name
      })
    );
  }

  clear_metadata(): void {
    this.confirm_service.confirm({
      header: this.translate.instant('comic-overview.title.clear-metadata'),
      message: this.translate.instant('comic-overview.message.clear-metadata'),
      icon: 'fa fa-exclamation',
      accept: () => {
        this.store.dispatch(
          new LibraryActions.LibraryClearMetadata({
            comic: this.comic
          })
        );
      }
    });
  }

  get_last_read_date(comic: Comic): string {
    const result = this.library.last_read_dates.find((entry: LastReadDate) => {
      return entry.comic_id === comic.id;
    });

    return result ? result.last_read_date : null;
  }

  delete_comic(): void {
    this.confirm_service.confirm({
      header: this.translate.instant('comic-overview.title.delete-comic'),
      message: this.translate.instant('comic-overview.message.delete-comic'),
      icon: 'fa fa-trash',
      accept: () => {
        this.store.dispatch(
          new LibraryActions.LibraryRemoveComic({ comic: this.comic })
        );
      }
    });
  }
}
