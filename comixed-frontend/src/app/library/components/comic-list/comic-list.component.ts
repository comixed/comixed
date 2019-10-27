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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  Comic,
  LibraryAdaptor,
  ReadingList,
  ReadingListEntry,
  SelectionAdaptor
} from 'app/library';
import { LibraryFilter } from 'app/models/actions/library-filter';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { MenuItem } from 'primeng/components/common/menuitem';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/library';
import { ReadingListAdaptor } from 'app/library/adaptors/reading-list.adaptor';

const FIRST = 'first';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.scss']
})
export class ComicListComponent implements OnInit, OnDestroy {
  _comics: Comic[] = [];
  _selectedComics: Comic[] = [];
  _currentComic: Comic = null;
  readingListsSubscription: Subscription;
  readingLists: ReadingList[];

  @Input() libraryFilter: LibraryFilter;
  @Input() showSelections: boolean;

  langChangeSubscription: Subscription;
  activatedRouteSubscription: Subscription;

  protected additionalSortFieldOptions: Array<SelectItem>;

  indexOfFirst = 0;
  layoutSubscription: Subscription;
  layout: string;
  sortFieldSubscription: Subscription;
  sortField: string;
  rowsSubscription: Subscription;
  rows: number;
  sameHeightSubscription: Subscription;
  sameHeight: boolean;
  coverSizeSubscription: Subscription;
  coverSize: number;
  contextMenu: MenuItem[];
  displayFilters = false;
  filters = null;

  constructor(
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private readingListAdaptor: ReadingListAdaptor,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAdditionalSortFieldOptions();
    this.layoutSubscription = this.libraryDisplayAdaptor.layout$.subscribe(
      layout => (this.layout = layout)
    );
    this.sortFieldSubscription = this.libraryDisplayAdaptor.sortField$.subscribe(
      sort_field => (this.sortField = sort_field)
    );
    this.rowsSubscription = this.libraryDisplayAdaptor.rows$.subscribe(
      rows => (this.rows = rows)
    );
    this.sameHeightSubscription = this.libraryDisplayAdaptor.sameHeight$.subscribe(
      same_height => (this.sameHeight = same_height)
    );
    this.coverSizeSubscription = this.libraryDisplayAdaptor.coverSize$.subscribe(
      cover_size => (this.coverSize = cover_size)
    );
    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (params: Params) => {
        if (params.first) {
          this.indexOfFirst = parseInt(params.first, 10);
        }
      }
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.loadContextMenu();
      }
    );
    this.readingListsSubscription = this.readingListAdaptor.reading_list$.subscribe(
      reading_lists => (this.readingLists = reading_lists)
    );
    this.readingListAdaptor.get_reading_lists();
  }

  ngOnDestroy() {
    this.layoutSubscription.unsubscribe();
    this.sortFieldSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
    this.sameHeightSubscription.unsubscribe();
    this.coverSizeSubscription.unsubscribe();
    this.activatedRouteSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
    this.readingListsSubscription.unsubscribe();
  }

  @Input() set comics(comics: Comic[]) {
    this._comics = comics;
    this.loadContextMenu();
  }

  get comics(): Comic[] {
    return this._comics;
  }

  @Input() set selectedComics(selectedComics: Comic[]) {
    this._selectedComics = selectedComics;
    this.loadContextMenu();
  }

  get selectedComics(): Comic[] {
    return this._selectedComics;
  }

  @Input() set currentComic(currentComic: Comic) {
    this._currentComic = currentComic;
    this.loadContextMenu();
  }

  get currentComic(): Comic {
    return this._currentComic;
  }

  private loadAdditionalSortFieldOptions(): void {
    this.additionalSortFieldOptions = [
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.sort-field.publisher'
        ),
        value: 'publisher'
      },
      {
        label: this.translateService.instant(
          'comic-list-toolbar.options.sort-field.series'
        ),
        value: 'series'
      }
    ];
  }

  setLayout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
    this.libraryDisplayAdaptor.setLayout(layout);
    this.layout = layout;
  }

  setIndexOfFirst(index: number): void {
    this.indexOfFirst = index;
  }

  private loadContextMenu() {
    this.contextMenu = [
      {
        label: this.translateService.instant('comic-list.popup.open-comic'),
        command: () => this.openComic(this._selectedComics[0]),
        icon: 'fas fa-book-open',
        visible: this._selectedComics.length === 1
      },
      {
        label: this.translateService.instant('comic-list.popup.select-all'),
        command: () => this.selectAll(),
        icon: 'fas fa-check-double',
        visible: this._comics.length > 0
      },
      {
        label: this.translateService.instant('comic-list.popup.deselect-all'),
        command: () => this.deselectAll(),
        icon: 'fas fa-broom',
        visible: this._selectedComics.length > 0
      },
      {
        label: this.translateService.instant('comic-list.popup.scrape-comics'),
        command: () => this.scrapeComics(),
        icon: 'fas fa-cloud',
        visible: this._selectedComics.length > 0
      },
      {
        label: this.translateService.instant('comic-list.popup.delete-comics'),
        command: () => this.deleteComics(),
        icon: 'fas fa-trash',
        visible: this._selectedComics.length > 0
      }
    ];

    if (this.readingLists) {
      this.contextMenu.push({ separator: true });
      const reading_lists = [];
      this.readingLists.forEach((reading_list: ReadingList) => {
        reading_lists.push({
          label: reading_list.name,
          icon: 'fa fa-fw fa-plus',
          visible: !this.allInReadingList(reading_list),
          command: () => this.addToReadingList(reading_list)
        });
        reading_lists.push({
          label: reading_list.name,
          icon: 'fa fa-fw fa-minus',
          visible: this.alreadyInReadingList(reading_list),
          command: () => this.removeFromReadingList(reading_list)
        });
      });
      this.contextMenu.push({
        label: this.translateService.instant('comic-list.popup.reading-lists'),
        items: reading_lists
      });
    }
  }

  openComic(comic: Comic): void {
    this.router.navigate(['/comics', comic.id]);
  }

  selectAll(): void {
    this.selectionAdaptor.selectComics(this._comics);
  }

  deselectAll(): void {
    this.selectionAdaptor.deselectComics(this._selectedComics);
  }

  scrapeComics(): void {
    this.router.navigate(['/scraping']);
  }

  deleteComics(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant('comic-list.delete-comics.header', {
        count: this._selectedComics.length
      }),
      message: this.translateService.instant(
        'comic-list.delete-comics.message'
      ),
      accept: () =>
        this.libraryAdaptor.deleteComics(
          this._selectedComics.map(comic => comic.id)
        )
    });
  }

  addToReadingList(readingList: ReadingList): void {
    const entries = readingList.entries;
    this.selectedComics.forEach((comic: Comic) => {
      if (
        !entries.find((entry: ReadingListEntry) => entry.comic.id === comic.id)
      ) {
        entries.push({ id: null, comic: comic });
      }
    });

    this.saveReadingList(readingList, entries);
  }

  removeFromReadingList(readingList: ReadingList): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-list.remove-from-reading-list.header'
      ),
      message: this.translateService.instant(
        'comic-list.remove-from-reading-list.message',
        { reading_list_name: readingList.name }
      ),
      accept: () => {
        const entries = readingList.entries.filter(
          (entry: ReadingListEntry) => {
            return !this.selectedComics.some(
              comic => comic.id === entry.comic.id
            );
          }
        );
        this.saveReadingList(readingList, entries);
      }
    });
  }

  saveReadingList(readingList: ReadingList, entries: ReadingListEntry[]): void {
    this.readingListAdaptor.save(readingList, entries);
  }

  alreadyInReadingList(readingList: ReadingList): boolean {
    const result = readingList.entries.some((entry: ReadingListEntry) => {
      return this.selectedComics.some((comic: Comic) => {
        return comic.id === entry.comic.id;
      });
    });

    return result;
  }

  allInReadingList(readingList: ReadingList): boolean {
    const result = readingList.entries.some((entry: ReadingListEntry) => {
      return this.selectedComics.every((comic: Comic) => {
        return comic.id === entry.comic.id;
      });
    });

    return result;
  }

  toggleComicSelection(comic: Comic): void {
    if (this.selectedComics.includes(comic)) {
      this.selectionAdaptor.deselectComic(comic);
    } else {
      this.selectionAdaptor.selectComic(comic);
    }
  }

  showFilters() {
    this.displayFilters = true;
  }

  setFilters(filters: LibraryFilter): void {
    this.filters = filters;
  }
}
