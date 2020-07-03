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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Comic } from 'app/comics';
import {
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comic-list-toolbar',
  templateUrl: './comic-list-toolbar.component.html',
  styleUrls: ['./comic-list-toolbar.component.scss']
})
export class ComicListToolbarComponent implements OnInit, OnDestroy {
  @Input() comics: Comic[] = [];
  @Input() dataView: any;
  @Input() comicVineUrl: string;
  @Output() startScraping = new EventEmitter<any>();

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
  showDetails = false;
  enableDetails = false;
  private _description: string = null;
  private _imageUrl: string = null;
  showNavigationTree = false;

  constructor(
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private readingListAdaptor: ReadingListAdaptor
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.selectionSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selections => (this.selectedComics = selections)
    );
    this.sortSubscription = this.libraryDisplayAdaptor.sortField$.subscribe(
      sortField => (this.sortField = sortField)
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

  ngOnInit() {}

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
    this.selectionSubscription.unsubscribe();
    this.sortSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
    this.layoutSubscription.unsubscribe();
    this.sameHeightSubscription.unsubscribe();
    this.coverSizeSubscription.unsubscribe();
  }

  @Input()
  set description(description: string) {
    this._description = description;
    this.enableDetails = !!this._imageUrl && !!this._description;
  }

  get description(): string {
    return this._description;
  }

  @Input()
  set imageUrl(url: string) {
    this._imageUrl = url;
    this.enableDetails = !!this._imageUrl && !!this._description;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  selectAll(): void {
    this.selectionAdaptor.selectComics(this.comics);
  }

  deselectAll(): void {
    this.selectionAdaptor.clearComicSelections();
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
          this.selectedComics
            .filter(comic => !comic.deletedDate)
            .map(comic => comic.id)
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
          'toolbar.options.sorting.volume-asc'
        ),
        value: 'volume'
      },
      {
        label: this.translateService.instant(
          'toolbar.options.sorting.volume-desc'
        ),
        value: '!volume'
      },
      {
        label: this.translateService.instant(
          'toolbar.options.sorting.issue-number-asc'
        ),
        value: 'sortableIssueNumber'
      },
      {
        label: this.translateService.instant(
          'toolbar.options.sorting.issue-number-desc'
        ),
        value: '!sortableIssueNumber'
      },
      {
        label: this.translateService.instant(
          'toolbar.options.sorting.added-date-asc'
        ),
        value: 'addedDate'
      },
      {
        label: this.translateService.instant(
          'toolbar.options.sorting.added-date-desc'
        ),
        value: '!addedDate'
      },
      {
        label: this.translateService.instant(
          'toolbar.options.sorting.cover-date-asc'
        ),
        value: 'coverDate'
      },
      {
        label: this.translateService.instant(
          'toolbar.options.sorting.cover-date-desc'
        ),
        value: '!coverDate'
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

  fireStartScraping() {
    this.startScraping.emit(true);
  }

  setDetailsVisible() {
    this.showDetails = true;
  }

  fireCreateReadingList() {
    this.readingListAdaptor.create();
  }
}
