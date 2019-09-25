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
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { LibraryAdaptor } from 'app/library';
import { Title } from '@angular/platform-browser';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-characters-page',
  templateUrl: './characters-page.component.html',
  styleUrls: ['./characters-page.component.css']
})
export class CharactersPageComponent implements OnInit, OnDestroy {
  charactersSubscription: Subscription;
  characters: ComicCollectionEntry[];
  langChangeSubscription: Subscription;

  protected rowsOptions: Array<SelectItem>;
  rows = 10;

  constructor(
    private titleService: Title,
    private libraryAdaptor: LibraryAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.charactersSubscription = this.libraryAdaptor.character$.subscribe(
      characters => {
        this.characters = characters;
        this.titleService.setTitle(
          this.translateService.instant('characters-page.title', {
            count: this.characters.length
          })
        );
      }
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.loadRowsOptions();
  }

  ngOnDestroy() {
    this.charactersSubscription.unsubscribe();
  }

  private loadRowsOptions(): void {
    this.rowsOptions = [
      {
        label: this.translateService.instant(
          'library-contents.options.rows.10-per-page'
        ),
        value: 10
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.25-per-page'
        ),
        value: 25
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.50-per-page'
        ),
        value: 50
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.100-per-page'
        ),
        value: 100
      }
    ];
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      {
        label: this.translateService.instant(
          'breadcrumb.entry.collections.root'
        )
      },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.collections.characters-page'
        ),
        routerLink: ['/characters']
      }
    ]);
  }
}
