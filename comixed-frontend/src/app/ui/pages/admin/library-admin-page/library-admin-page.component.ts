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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LibraryAdaptor } from 'app/library';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-library-admin-page',
  templateUrl: './library-admin-page.component.html',
  styleUrls: ['./library-admin-page.component.scss']
})
export class LibraryAdminPageComponent implements OnInit, OnDestroy {
  importCountSubscription: Subscription;
  importCount = 0;
  rescanCountSubscription: Subscription;
  rescanCount = 0;
  langChangeSubscription: Subscription;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {}

  ngOnInit() {
    this.titleService.setTitle(
      this.translateService.instant('library-admin-page.title')
    );
    this.importCountSubscription = this.libraryAdaptor.processingCount$.subscribe(
      import_count => (this.importCount = import_count)
    );
    this.rescanCountSubscription = this.libraryAdaptor.rescanCount$.subscribe(
      rescan_count => (this.rescanCount = rescan_count)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.importCountSubscription.unsubscribe();
    this.rescanCountSubscription.unsubscribe();
  }

  rescanLibrary(): void {
    this.libraryAdaptor.startRescan();
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      {
        label: this.translateService.instant('breadcrumb.entry.admin.root')
      },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.admin.library-admin'
        )
      }
    ]);
  }
}
