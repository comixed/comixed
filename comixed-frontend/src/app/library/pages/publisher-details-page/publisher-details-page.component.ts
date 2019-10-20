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
import { Comic, LibraryAdaptor, SelectionAdaptor } from 'app/library';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-publisher-details-page',
  templateUrl: './publisher-details-page.component.html',
  styleUrls: ['./publisher-details-page.component.scss']
})
export class PublisherDetailsPageComponent implements OnInit, OnDestroy {
  publishersSubscription: Subscription;
  comics: Comic[];
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[];
  langChangeSubscription: Subscription;

  protected layout = 'grid';
  protected sortField = 'volume';
  protected rows = 10;
  protected sameHeight = true;
  protected coverSize = 200;

  publisherName: string;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.publisherName = params['name'];
    });
  }

  ngOnInit() {
    this.publishersSubscription = this.libraryAdaptor.publisher$.subscribe(
      publishers => {
        const result = publishers.find(
          publisher => publisher.name === this.publisherName
        );
        this.comics = result ? result.comics : [];
        this.titleService.setTitle(
          this.translateService.instant('publisher-details-page.title', {
            name: this.publisherName,
            count: this.comics.length
          })
        );
      }
    );
    this.selectedComicsSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selected_comics => (this.selectedComics = selected_comics)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.publishersSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  set_layout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
  }

  set_sort_field(sort_field: string): void {
    this.sortField = sort_field;
  }

  set_rows(rows: number): void {
    this.rows = rows;
  }

  set_cover_size(cover_size: number): void {
    this.coverSize = cover_size;
  }

  set_same_height(same_height: boolean): void {
    this.sameHeight = same_height;
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
          'breadcrumb.entry.collections.publishers-page'
        ),
        routerLink: ['/publishers']
      },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.collections.publisher-details-page',
          { name: this.publisherName }
        )
      }
    ]);
  }
}
