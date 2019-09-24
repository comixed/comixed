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
import { ConfirmationService, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Comic, ComicFormat, ScanType } from 'app/library';
import { Subscription } from 'rxjs';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';

@Component({
  selector: 'app-comic-overview',
  templateUrl: './comic-overview.component.html',
  styleUrls: ['./comic-overview.component.scss']
})
export class ComicOverviewComponent implements OnInit, OnDestroy {
  @Input() comic: Comic;
  @Input() is_admin: boolean;

  scanTypes: ScanType[];
  scanTypeOptions: SelectItem[];
  formats: ComicFormat[];
  formatOptions: SelectItem[];

  scanTypeSubscription: Subscription;
  scanType: ScanType;
  formatSubscription: Subscription;
  format: ComicFormat;
  sortName: string;

  constructor(
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private comicAdaptor: ComicAdaptor
  ) {}

  ngOnInit() {
    this.format = this.comic.format;
    this.scanType = this.comic.scanType;
    this.scanTypeSubscription = this.comicAdaptor.scanTypes$.subscribe(
      scanTypes => {
        this.scanTypes = scanTypes;
        this.loadScanTypeOptions();
      }
    );
    this.comicAdaptor.getScanTypes();
    this.formatSubscription = this.comicAdaptor.formats$.subscribe(formats => {
      this.formats = formats;
      this.loadFormatOptions();
    });
    this.comicAdaptor.getFormats();
  }

  loadScanTypeOptions(): void {
    this.scanTypeOptions = [
      {
        label: this.translateService.instant(
          'comic-overview.scan-type.option.select-one'
        ),
        value: null
      }
    ];
    this.scanTypes.forEach(scanType =>
      this.scanTypeOptions.push({ label: scanType.name, value: scanType })
    );
  }

  loadFormatOptions(): void {
    this.formatOptions = [
      {
        label: this.translateService.instant(
          'comic-overview.format.option.select-one'
        ),
        value: null
      }
    ];
    this.formats.forEach(format =>
      this.formatOptions.push({ label: format.name, value: format })
    );
  }

  ngOnDestroy(): void {
    this.scanTypeSubscription.unsubscribe();
    this.formatSubscription.unsubscribe();
  }

  copyComicFormat(): void {
    this.format = this.comic.format;
  }

  setComicFormat(format: ComicFormat): void {
    this.comicAdaptor.saveComic({ ...this.comic, format: format });
  }

  copyScanType(): void {
    this.scanType = this.comic.scanType;
  }

  setScanType(scanType: ScanType): void {
    this.comicAdaptor.saveComic({ ...this.comic, scanType: scanType });
  }

  copySortName(): void {
    this.sortName = this.comic.sortName || '';
  }

  saveSortName(): void {
    this.comicAdaptor.saveComic({ ...this.comic, sortName: this.sortName });
  }

  clearMetadata(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-overview.title.clear-metadata'
      ),
      message: this.translateService.instant(
        'comic-overview.message.clear-metadata'
      ),
      icon: 'fa fa-exclamation',
      accept: () => this.comicAdaptor.clearMetadata(this.comic)
    });
  }

  deleteComic(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-overview.title.delete-comic'
      ),
      message: this.translateService.instant(
        'comic-overview.message.delete-comic'
      ),
      icon: 'fa fa-trash',
      accept: () => this.comicAdaptor.deleteComic(this.comic)
    });
  }
}
