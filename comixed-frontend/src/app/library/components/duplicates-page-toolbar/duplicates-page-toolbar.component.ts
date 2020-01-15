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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LibraryDisplayAdaptor } from 'app/library';
import { ConfirmationService, MenuItem, SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DuplicatePage } from 'app/library/models/duplicate-page';
import { DuplicatePagesAdaptors } from 'app/library/adaptors/duplicate-pages.adaptor';

@Component({
  selector: 'app-duplicates-page-toolbar',
  templateUrl: './duplicates-page-toolbar.component.html',
  styleUrls: ['./duplicates-page-toolbar.component.scss']
})
export class DuplicatesPageToolbarComponent implements OnInit, OnDestroy {
  @Input() dataView: any;
  @Input() gridLayout: boolean;
  @Input() pageSize = 200;
  @Input() sameHeight = false;
  @Input() showPages = 10;
  @Input() pages: DuplicatePage[];

  private _selectedPages: DuplicatePage[];

  langChangeSubscription: Subscription;
  showPagesOptions: SelectItem[];
  blockingOptions: MenuItem[];
  deletingOptions: MenuItem[];

  constructor(
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private duplicatesPagesAdaptors: DuplicatePagesAdaptors
  ) {}

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
  }

  @Input()
  set selectedPages(selectedPages: DuplicatePage[]) {
    this._selectedPages = selectedPages;
    this.loadBlockingOptions();
    this.loadDeletingOptions();
  }

  get selectedPages(): DuplicatePage[] {
    return this._selectedPages;
  }

  changePageCount(pageCount: any) {
    this.libraryDisplayAdaptor.setDisplayRows(pageCount);
  }

  private loadTranslations() {
    this.showPagesOptions = [
      {
        label: this.translateService.instant(
          'duplicates-page.options.page-count.10-pages'
        ),
        value: 10
      },
      {
        label: this.translateService.instant(
          'duplicates-page.options.page-count.25-pages'
        ),
        value: 25
      },
      {
        label: this.translateService.instant(
          'duplicates-page.options.page-count.50-pages'
        ),
        value: 50
      },
      {
        label: this.translateService.instant(
          'duplicates-page.options.page-count.100-pages'
        ),
        value: 100
      }
    ];
    this.loadBlockingOptions();
  }

  loadBlockingOptions(): void {
    this.blockingOptions = [
      {
        label: this.translateService.instant(
          'duplicates-page-toolbar.options.blocking.turn-on'
        ),
        command: () => this.setBlocking(true)
      },
      {
        label: this.translateService.instant(
          'duplicates-page-toolbar.options.blocking.turn-off'
        ),
        command: () => this.setBlocking(false)
      }
    ];
  }

  setGridLayout(useGrid: boolean) {
    const layout = useGrid ? 'grid' : 'list';
    this.libraryDisplayAdaptor.setLayout(layout);
    this.dataView.changeLayout(layout);
  }

  useSameHeight(sameHeight: any) {
    this.libraryDisplayAdaptor.setSameHeight(sameHeight);
  }

  setPageSize(size: number, save: boolean) {
    this.libraryDisplayAdaptor.setCoverSize(size, save);
  }

  selectAll() {
    this.duplicatesPagesAdaptors.selectPages(this.pages);
  }

  deselectAll() {
    this.duplicatesPagesAdaptors.deselectPages(this.selectedPages);
  }

  setBlocking(enabled: boolean): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'duplicates-page-toolbar.set-blocking.header'
      ),
      message: this.translateService.instant(
        'duplicates-page-toolbar.set-blocking.message',
        { blocking: enabled }
      ),
      accept: () => {
        this.duplicatesPagesAdaptors.setBlocking(this.selectedPages, enabled);
        this.duplicatesPagesAdaptors.deselectPages(this.selectedPages);
      }
    });
  }

  private loadDeletingOptions() {
    this.deletingOptions = [
      {
        label: this.translateService.instant(
          'duplicates-page-toolbar.options.deleting.mark'
        ),
        command: () => this.setDeleted(true)
      },
      {
        label: this.translateService.instant(
          'duplicates-page-toolbar.options.deleting.unmark'
        ),
        command: () => this.setDeleted(false)
      }
    ];
  }

  private setDeleted(deleted: boolean): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'duplicates-page-toolbar.set-deleted.header'
      ),
      message: this.translateService.instant(
        'duplicates-page-toolbar.set-deleted.message',
        { deleted: deleted }
      ),
      accept: () => {
        this.duplicatesPagesAdaptors.setDeleted(this.selectedPages, deleted);
        this.duplicatesPagesAdaptors.deselectPages(this.selectedPages);
      }
    });
  }
}
