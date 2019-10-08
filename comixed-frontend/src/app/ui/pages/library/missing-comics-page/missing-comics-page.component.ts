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
import { Comic, LibraryAdaptor, SelectionAdaptor } from 'app/library';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-missing-comics-page',
  templateUrl: './missing-comics-page.component.html',
  styleUrls: ['./missing-comics-page.component.scss']
})
export class MissingComicsPageComponent implements OnInit, OnDestroy {
  comicsSubscription: Subscription;
  comics: Comic[] = [];
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[] = [];
  langChangeSubscription: Subscription;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {}

  ngOnInit() {
    this.comicsSubscription = this.libraryAdaptor.comic$.subscribe(comics => {
      this.comics = comics;
      this.titleService.setTitle(
        this.translateService.instant('missing-comics-page.title', {
          count: this.comics.filter(comic => comic.missing).length
        })
      );
    });
    this.selectedComicsSubscription = this.selectionAdaptor.comic_selection$.subscribe(
      selected_comics => (this.selectedComics = selected_comics)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.comicsSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.admin.root') },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.admin.missing-comics'
        )
      }
    ]);
  }
}
