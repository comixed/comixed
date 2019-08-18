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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LibraryAdaptor, ScanType } from 'app/library';
import { Comic } from 'app/library';
import { ComicFormat } from 'app/library';
import { Subscription } from 'rxjs';
import { LastReadDate } from 'app/library/models/last-read-date';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-comic-overview',
  templateUrl: './comic-overview.component.html',
  styleUrls: ['./comic-overview.component.scss']
})
export class ComicOverviewComponent implements OnInit, OnDestroy {
  @Input() is_admin: boolean;
  @Input() comic: Comic;

  scan_types: Array<SelectItem>;
  formats: Array<SelectItem>;
  last_read_dates_subscription: Subscription;
  last_read_dates: LastReadDate[];

  scan_type_subscription: Subscription;
  scan_type: ScanType;
  format_subscription: Subscription;
  format: ComicFormat;
  sort_name: string;

  constructor(
    private library_adaptor: LibraryAdaptor,
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
    this.scan_type_subscription = this.library_adaptor.scan_type$.subscribe(
      scan_types => {
        this.scan_types = [];
        scan_types.forEach(scan_type =>
          this.scan_types.push({ label: scan_type.name, value: scan_type })
        );
      }
    );
    this.format_subscription = this.library_adaptor.format$.subscribe(
      formats => {
        this.formats = [
          {
            label: 'Select one...',
            value: null
          }
        ];
        formats.forEach(format =>
          this.formats.push({ label: format.name, value: format })
        );
      }
    );
    this.last_read_dates_subscription = this.library_adaptor.last_read_date$.subscribe(
      last_read_dates => (this.last_read_dates = last_read_dates)
    );
  }

  ngOnDestroy(): void {
    this.scan_type_subscription.unsubscribe();
    this.format_subscription.unsubscribe();
    this.last_read_dates_subscription.unsubscribe();
  }

  copy_comic_format(comic: Comic): void {
    this.format = comic.format;
  }

  set_comic_format(comic: Comic, format: ComicFormat): void {
    if (format) {
      comic.format = format;
      this.library_adaptor.save_comic(comic);
    }
  }

  copy_scan_type(comic: Comic): void {
    this.scan_type = comic.scan_type;
  }

  set_scan_type(comic: Comic, scan_type: ScanType): void {
    if (scan_type) {
      comic.scan_type = scan_type;
      this.library_adaptor.save_comic(comic);
    }
  }

  copy_sort_name(comic: Comic): void {
    this.sort_name = comic.sort_name || '';
  }

  save_sort_name(comic: Comic): void {
    comic.sort_name = this.sort_name;
    this.library_adaptor.save_comic(comic);
  }

  clear_metadata(): void {
    this.confirm_service.confirm({
      header: this.translate.instant('comic-overview.title.clear-metadata'),
      message: this.translate.instant('comic-overview.message.clear-metadata'),
      icon: 'fa fa-exclamation',
      accept: () => this.library_adaptor.clear_metadata(this.comic)
    });
  }

  get_last_read_date(comic: Comic): number {
    const last_read_date = this.last_read_dates.find(
      last_read => last_read.comic_id === comic.id
    );

    return last_read_date ? last_read_date.last_read_date : null;
  }

  delete_comic(): void {
    this.confirm_service.confirm({
      header: this.translate.instant('comic-overview.title.delete-comic'),
      message: this.translate.instant('comic-overview.message.delete-comic'),
      icon: 'fa fa-trash',
      accept: () => this.library_adaptor.delete_comics_by_id([this.comic.id])
    });
  }
}
