/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { LibraryAdaptor, LibraryModuleState, SelectionAdaptor } from 'app/library';
import { Comic } from 'app/comics';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { setBreadcrumbs } from 'app/actions/breadcrumb.actions';

@Component({
  selector: 'app-duplicate-comics-page',
  templateUrl: './duplicate-comics-page.component.html',
  styleUrls: ['./duplicate-comics-page.component.scss']
})
export class DuplicateComicsPageComponent implements OnInit, OnDestroy {
  comicsSubscription: Subscription;
  duplicates: Comic[] = [];
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[] = [];
  langChangeSubscription: Subscription;

  constructor(
    private store: Store<LibraryModuleState>,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private translateService: TranslateService
  ) {
    this.comicsSubscription = this.libraryAdaptor.comic$.subscribe(
      comics =>
        (this.duplicates = comics.filter(comic => comic.duplicateCount > 0))
    );
    this.selectedComicsSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selections => (this.selectedComics = selections)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.comicsSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.store.dispatch(
      setBreadcrumbs({
        entries: [
          {
            label: this.translateService.instant(
              'breadcrumb.entry.library-page'
            ),
            link: '/comics'
          },
          {
            label: this.translateService.instant(
              'breadcrumb.entry.duplicates-page'
            )
          }
        ]
      })
    );
  }
}
