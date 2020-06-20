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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { Comic, ComicFormat, ScanType } from 'app/comics';
import { LibraryAdaptor } from 'app/library';
import { LoggerService } from '@angular-ru/logger';

@Component({
  selector: 'app-comic-overview',
  templateUrl: './comic-overview.component.html',
  styleUrls: ['./comic-overview.component.scss']
})
export class ComicOverviewComponent implements OnInit, OnDestroy {
  @Input() comic: Comic;
  @Input() is_admin: boolean;

  comicBackup: Comic;
  scanTypes: ScanType[];
  scanTypeOptions: SelectItem[];
  formats: ComicFormat[];
  formatOptions: SelectItem[];
  scanTypeSubscription: Subscription;
  formatSubscription: Subscription;
  editing = false;
  publishersSubscription: Subscription;
  publishersNames: string[] = [];
  publisherNameOptions: string[] = [];
  seriesSubscription: Subscription;
  seriesNames: string[] = [];
  seriesNameOptions: string[] = [];
  showFileEntriesDialog = false;

  constructor(
    private logger: LoggerService,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private comicAdaptor: ComicAdaptor,
    private libraryAdaptor: LibraryAdaptor
  ) {
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
    this.publishersSubscription = this.libraryAdaptor.publishers$.subscribe(
      publishers => {
        this.logger.info('received publishers:', publishers);
        this.publishersNames = publishers
          .filter(publisher => !!publisher.name)
          .map(publisher => publisher.name);
      }
    );
    this.seriesSubscription = this.libraryAdaptor.series$.subscribe(series => {
      this.logger.info('received series:', series);
      this.seriesNames = series
        .filter(entry => !!entry.name)
        .map(entry => entry.name);
    });
  }

  ngOnInit() {}

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
    this.publishersSubscription.unsubscribe();
    this.seriesSubscription.unsubscribe();
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

  undeleteComic() {
    this.comicAdaptor.restoreComic(this.comic);
  }

  startEditing() {
    this.editing = true;
    this.backupComic();
  }

  filterPublisherNames(nameEntered: string) {
    this.publisherNameOptions = this.publishersNames.filter(name =>
      name.toLowerCase().startsWith(nameEntered.toLowerCase())
    );
  }

  backupComic() {
    this.comicBackup = Object.assign({}, this.comic);
  }

  saveChanges() {
    this.confirmationService.confirm({
      header: this.translateService.instant('comic-overview.save-comic.header'),
      message: this.translateService.instant(
        'comic-overview.save-comic.message'
      ),
      icon: 'fa fa-save',
      accept: () => {
        this.comicAdaptor.saveComic(this.comic);
        this.editing = false;
      }
    });
  }

  undoChanges() {
    this.logger.debug('undoing changes:', this.comicBackup);
    this.comic = Object.assign({}, this.comicBackup);
    this.editing = false;
  }

  filterSeriesNames(nameEntered: string) {
    this.seriesNameOptions = this.seriesNames.filter(name =>
      name.toLowerCase().startsWith(nameEntered.toLowerCase())
    );
  }

  toggleFileEntriesDialog(show: boolean) {
    this.logger.debug(`${show ? 'showing' : 'hiding'} file entries dialog`);
    this.showFileEntriesDialog = show;
  }

  markAsRead(read: boolean): void {
    this.logger.debug(
      `toggling read start ${read ? 'on' : 'off'} for comic:`,
      this.comic
    );
    if (read) {
      this.comicAdaptor.markAsRead(this.comic);
    } else {
      this.comicAdaptor.markAsUnread(this.comic);
    }
  }
}
