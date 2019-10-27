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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  Comic,
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  SelectionAdaptor
} from 'app/library';
import { Subscription } from 'rxjs';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comic-list-toolbar',
  templateUrl: './comic-list-toolbar.component.html',
  styleUrls: ['./comic-list-toolbar.component.scss']
})
export class ComicListToolbarComponent implements OnInit, OnDestroy {
  @Input() comics: Comic[] = [];
  @Input() dataView: any;
  @Output() toggleFilters = new EventEmitter<boolean>();

  selectionSubscription: Subscription;
  selectedComics: Comic[] = [];
  langChangeSubscription: Subscription;
  sortOptions: SelectItem[];
  sortSubscription: Subscription;
  sortField = '';
  rowsOptions: SelectItem[];
  rowsSubscription: Subscription;
  rows = 10;
  layoutSubscription: Subscription;
  gridLayout = true;
  sameHeightSubscription: Subscription;
  sameHeight = true;
  coverSizeSubscription: Subscription;
  coverSize = 200;

  constructor(
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor
  ) {}

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.selectionSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selections => (this.selectedComics = selections)
    );
    this.sortSubscription = this.libraryDisplayAdaptor.sortField$.subscribe(
      field => (this.sortField = field)
    );
    this.rowsSubscription = this.libraryDisplayAdaptor.rows$.subscribe(
      rows => (this.rows = rows)
    );
    this.layoutSubscription = this.libraryDisplayAdaptor.layout$.subscribe(
      layout => (this.gridLayout = layout === 'grid')
    );
    this.sameHeightSubscription = this.libraryDisplayAdaptor.sameHeight$.subscribe(
      sameHeight => (this.sameHeight = sameHeight)
    );
    this.coverSizeSubscription = this.libraryDisplayAdaptor.coverSize$.subscribe(
      size => (this.coverSize = size)
    );
  }

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
    this.selectionSubscription.unsubscribe();
    this.sortSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
    this.layoutSubscription.unsubscribe();
    this.sameHeightSubscription.unsubscribe();
    this.coverSizeSubscription.unsubscribe();
  }

  selectAll(): void {
    this.selectionAdaptor.selectComics(this.comics);
  }

  deselectAll(): void {
    this.selectionAdaptor.clearComicSelections();
  }

  scrapeComics(): void {
    this.router.navigateByUrl('/scraping');
  }

  deleteComics(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-list-toolbar.delete-comics.header'
      ),
      message: this.translateService.instant(
        'comic-list-toolbar.delete-comics.message',
        { count: this.selectedComics.length }
      ),
      accept: () => {
        this.libraryAdaptor.deleteComics(
          this.selectedComics.map(comic => comic.id)
        );
        this.selectionAdaptor.clearComicSelections();
      }
    });
  }

  private loadTranslations() {
    this.loadSortOptions();
    this.loadRowsOptions();
  }

  private loadSortOptions() {
    this.sortOptions = [
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.sorting.volume'
        ),
        value: 'volume'
      },
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.sorting.issue-number'
        ),
        value: 'sortableIssueNumber'
      },
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.sorting.added-date'
        ),
        value: 'addedDate'
      },
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.sorting.cover-date'
        ),
        value: 'coverDate'
      }
    ];
  }

  changeSortField(sortField: string): void {
    this.libraryDisplayAdaptor.setSortField(sortField);
  }

  private loadRowsOptions() {
    this.rowsOptions = [
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.rows.10-comics'
        ),
        value: 10
      },
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.rows.25-comics'
        ),
        value: 25
      },
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.rows.50-comics'
        ),
        value: 50
      },
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.rows.100-comics'
        ),
        value: 100
      }
    ];
  }

  changeRows(rows: number): void {
    this.libraryDisplayAdaptor.setDisplayRows(rows);
  }

  setGridLayout(useGrid: boolean): void {
    const layout = useGrid ? 'grid' : 'list';
    this.libraryDisplayAdaptor.setLayout(layout);
    this.dataView.changeLayout(layout);
  }

  useSameHeight(sameHeight: boolean): void {
    this.libraryDisplayAdaptor.setSameHeight(sameHeight);
  }

  setCoverSize(size: number, save: boolean): void {
    this.libraryDisplayAdaptor.setCoverSize(size, save);
  }
}
