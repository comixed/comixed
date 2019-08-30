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
import { LibraryAdaptor } from 'app/library';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-series-page',
  templateUrl: './series-page.component.html',
  styleUrls: ['./series-page.component.css']
})
export class SeriesPageComponent implements OnInit, OnDestroy {
  series_subscription: Subscription;
  series: ComicCollectionEntry[];

  protected rows_options: Array<SelectItem>;
  rows = 10;

  constructor(
    private title_service: Title,
    private translate_service: TranslateService,
    private library_adaptor: LibraryAdaptor
  ) {}

  ngOnInit() {
    this.series_subscription = this.library_adaptor.serie$.subscribe(series => {
      this.series = series;
      this.title_service.setTitle(
        this.translate_service.instant('series-page.title', {
          count: this.series.length
        })
      );
    });
    this.load_rows_options();
  }

  ngOnDestroy() {
    this.series_subscription.unsubscribe();
  }

  private load_rows_options(): void {
    this.rows_options = [
      {
        label: this.translate_service.instant(
          'library-contents.options.rows.10-per-page'
        ),
        value: 10
      },
      {
        label: this.translate_service.instant(
          'library-contents.options.rows.25-per-page'
        ),
        value: 25
      },
      {
        label: this.translate_service.instant(
          'library-contents.options.rows.50-per-page'
        ),
        value: 50
      },
      {
        label: this.translate_service.instant(
          'library-contents.options.rows.100-per-page'
        ),
        value: 100
      }
    ];
  }
}
