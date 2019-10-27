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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LibraryAdaptor } from 'app/library';
import { LibraryFilter } from 'app/library/models/library-filter';
import { FilterAdaptor } from 'app/library/adaptors/filter.adaptor';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-library-filter',
  templateUrl: './library-filter.component.html',
  styleUrls: ['./library-filter.component.scss']
})
export class LibraryFilterComponent implements OnInit, OnDestroy {
  @Output() filters = new EventEmitter<LibraryFilter>();

  publisherOptionsSubscription: Subscription;
  publisherOptions: SelectItem[] = [];
  publisherSubscription: Subscription;
  publisher: string;

  seriesOptionSubscription: Subscription;
  seriesOptions: SelectItem[] = [];
  seriesSubscription: Subscription;
  series: string;

  constructor(
    private store: Store<AppState>,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor,
    private filterAdaptor: FilterAdaptor
  ) {}

  ngOnInit() {
    this.publisherOptionsSubscription = this.libraryAdaptor.publisher$.subscribe(
      publishers => {
        this.publisherOptions = [
          {
            label: this.translateService.instant(
              'library-filter.option.select-all-publishers'
            ),
            value: null
          }
        ].concat(
          publishers.map(entry => {
            return { label: entry.name, value: entry.name };
          })
        );
      }
    );
    this.publisherSubscription = this.filterAdaptor.publisher$.subscribe(
      publisher => {
        this.publisher = publisher;
        this.updateLibraryFilter();
      }
    );
    this.seriesOptionSubscription = this.libraryAdaptor.serie$.subscribe(
      series => {
        this.seriesOptions = [
          {
            label: this.translateService.instant(
              'library-filter.option.select-all-series'
            ),
            value: null
          }
        ].concat(
          series.map(entry => {
            return { label: entry.name, value: entry.name };
          })
        );
      }
    );
    this.seriesSubscription = this.filterAdaptor.series$.subscribe(series => {
      this.series = series;
      this.updateLibraryFilter();
    });
  }

  ngOnDestroy() {
    this.publisherOptionsSubscription.unsubscribe();
    this.publisherSubscription.unsubscribe();
    this.seriesOptionSubscription.unsubscribe();
    this.seriesSubscription.unsubscribe();
  }

  resetFilters(): void {
    this.filterAdaptor.clearFilters();
  }

  private updateLibraryFilter(): void {
    this.filters.emit({
      publisher: this.publisher,
      series: this.series
    });
  }

  setPublisher(publisher: string) {
    this.filterAdaptor.setPublisher(publisher);
  }

  setSeries(series: string) {
    this.filterAdaptor.setSeries(series);
  }
}
