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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LibraryAdaptor, LibraryModuleState } from 'app/library';
import { Store } from '@ngrx/store';
import { setBreadcrumbs } from 'app/actions/breadcrumb.actions';

@Component({
  selector: 'app-library-admin-page',
  templateUrl: './library-admin-page.component.html',
  styleUrls: ['./library-admin-page.component.scss']
})
export class LibraryAdminPageComponent implements OnInit, OnDestroy {
  importCountSubscription: Subscription;
  importCount = 0;
  langChangeSubscription: Subscription;

  constructor(
    private store: Store<LibraryModuleState>,
    private titleService: Title,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor
  ) {}

  ngOnInit() {
    this.titleService.setTitle(
      this.translateService.instant('library-admin-page.title')
    );
    this.importCountSubscription = this.libraryAdaptor.processingCount$.subscribe(
      import_count => (this.importCount = import_count)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.importCountSubscription.unsubscribe();
  }

  rescanLibrary(): void {
    this.libraryAdaptor.startRescan();
  }

  private loadTranslations() {
    this.store.dispatch(
      setBreadcrumbs({
        entries: [
          {
            label: this.translateService.instant('breadcrumb.entry.admin.root')
          },
          {
            label: this.translateService.instant(
              'breadcrumb.entry.admin.library-admin'
            )
          }
        ]
      })
    );
  }
}
