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
import { DuplicatePage } from 'app/library/models/duplicate-page';
import { DuplicatePagesAdaptors } from 'app/library/adaptors/duplicate-pages.adaptor';
import { LibraryDisplayAdaptor, LibraryModuleState } from 'app/library';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { setBreadcrumbs } from 'app/actions/breadcrumb.actions';

@Component({
  selector: 'app-duplicates-page',
  templateUrl: './duplicates-page.component.html',
  styleUrls: ['./duplicates-page.component.scss']
})
export class DuplicatesPageComponent implements OnInit, OnDestroy {
  duplicatesSubscription: Subscription;
  duplicates: DuplicatePage[];
  selectedSubscription: Subscription;
  selected: DuplicatePage[];
  fetchingSubscription: Subscription;
  fetching = false;
  layoutSubscription: Subscription;
  layout = 'grid';
  pageSizeSubscription: Subscription;
  pageSize = 200;
  sameHeightSubscription: Subscription;
  sameHeight = false;
  pageCountSubscription: Subscription;
  pageCount = 10;
  langChangeSubscription: Subscription;

  constructor(
    private store: Store<LibraryModuleState>,
    private duplicatesAdaptor: DuplicatePagesAdaptors,
    private displayAdaptor: LibraryDisplayAdaptor,
    private translateService: TranslateService,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.layoutSubscription = this.displayAdaptor.layout$.subscribe(
      layout => (this.layout = layout)
    );
    this.pageSizeSubscription = this.displayAdaptor.coverSize$.subscribe(
      pageSize => (this.pageSize = pageSize)
    );
    this.sameHeightSubscription = this.displayAdaptor.sameHeight$.subscribe(
      sameHeight => (this.sameHeight = sameHeight)
    );
    this.pageCountSubscription = this.displayAdaptor.rows$.subscribe(
      pageCount => (this.pageCount = pageCount)
    );
    this.duplicatesSubscription = this.duplicatesAdaptor.pages$.subscribe(
      duplicates => (this.duplicates = duplicates)
    );
    this.selectedSubscription = this.duplicatesAdaptor.selected$.subscribe(
      selected => (this.selected = selected)
    );
    this.fetchingSubscription = this.duplicatesAdaptor.fetchingAll$.subscribe(
      fetching => (this.fetching = fetching)
    );
    this.duplicatesAdaptor.getAll();
  }

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
    this.layoutSubscription.unsubscribe();
    this.pageSizeSubscription.unsubscribe();
    this.sameHeightSubscription.unsubscribe();
    this.pageCountSubscription.unsubscribe();
    this.duplicatesSubscription.unsubscribe();
    this.selectedSubscription.unsubscribe();
    this.fetchingSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.store.dispatch(
      setBreadcrumbs({
        entries: [
          {
            label: this.translateService.instant(
              'breadcrumb.admin.duplicates-page'
            )
          }
        ]
      })
    );
    this.titleService.setTitle(
      this.translateService.instant('duplicates-page.title')
    );
  }

  isSelected(duplicate: DuplicatePage): boolean {
    return this.selected.includes(duplicate);
  }

  setSelected(page: DuplicatePage, selected: boolean): void {
    if (!!page) {
      if (selected) {
        this.duplicatesAdaptor.selectPages([page]);
      } else {
        this.duplicatesAdaptor.deselectPages([page]);
      }
    }
  }
}
