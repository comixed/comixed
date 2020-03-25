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
  Output,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Comic } from 'app/comics';
import { ScrapingAdaptor } from 'app/comics/adaptors/scraping.adaptor';
import {
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  SelectionAdaptor
} from 'app/library';
import { ReadingListAdaptor } from 'app/library/adaptors/reading-list.adaptor';
import { LibraryFilter } from 'app/library/models/library-filter';
import { ReadingList } from 'app/library/models/reading-list/reading-list';
import { ReadingListEntry } from 'app/library/models/reading-list/reading-list-entry';
import { LoadPageEvent } from 'app/library/models/ui/load-page-event';
import { AuthenticationAdaptor } from 'app/user';
import { generateContextMenuItems } from 'app/user-experience';
import { ContextMenuAdaptor } from 'app/user-experience/adaptors/context-menu.adaptor';
import { LoggerService } from '@angular-ru/logger';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { MenuItem } from 'primeng/components/common/menuitem';
import { ContextMenu } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';

export const COMIC_LIST_MENU_SELECT_ALL = 'comic-list-scrape-select-all';
export const COMIC_LIST_MENU_DESELECT_ALL = 'comic-list-scrape-deselect-all';
export const COMIC_LIST_MENU_DELETE_SELECTED = 'comic-list-delete-selected';
export const COMIC_LIST_MENU_SCRAPE_SELECTED = 'comic-list-scrape-selected';
export const COMIC_LIST_MENU_CONVERT_COMIC = 'comic-list-convert-comic';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.scss']
})
export class ComicListComponent implements OnInit, OnDestroy {
  _comics: Comic[] = [];
  _selectedComics: Comic[] = [];
  readingListsSubscription: Subscription;
  readingLists: ReadingList[];

  @Input() showSelections: boolean;
  @Input() imageUrl: string;
  @Input() description: string;
  @Input() comicVineUrl: string;
  @Output() loadPage = new EventEmitter<LoadPageEvent>();

  @ViewChild('contextMenu', { static: false }) contextMenu: ContextMenu;

  activatedRouteSubscription: Subscription;
  contextMenuItemsSubscription: Subscription;
  contextMenuItems: MenuItem[] = [];
  mouseEventSubscription: Subscription;

  protected additionalSortFieldOptions: Array<SelectItem>;

  indexOfFirst = 0;
  layoutSubscription: Subscription;
  layout: string;
  sortFieldSubscription: Subscription;
  sortField = '';
  sortOrder = 1;
  rowsSubscription: Subscription;
  rows: number;
  sameHeightSubscription: Subscription;
  sameHeight: boolean;
  coverSizeSubscription: Subscription;
  coverSize: number;
  displayFilters = false;
  filters = null;
  showConvertComics = false;

  constructor(
    private logger: LoggerService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private selectionAdaptor: SelectionAdaptor,
    private readingListAdaptor: ReadingListAdaptor,
    private contextMenuAdaptor: ContextMenuAdaptor,
    private scrapingAdaptor: ScrapingAdaptor,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.addContextMenuItems();
    this.contextMenuItemsSubscription = this.contextMenuAdaptor.items$.subscribe(
      items => {
        this.contextMenuItems = generateContextMenuItems(
          items,
          this.translateService
        );
      }
    );
    this.mouseEventSubscription = this.contextMenuAdaptor.mouseEvent$.subscribe(
      event => {
        if (!!event && !!this.contextMenu) {
          this.contextMenu.show(event);
        }
      }
    );
    this.loadAdditionalSortFieldOptions();
    this.layoutSubscription = this.libraryDisplayAdaptor.layout$.subscribe(
      layout => (this.layout = layout)
    );
    this.sortFieldSubscription = this.libraryDisplayAdaptor.sortField$.subscribe(
      sortField => {
        if (sortField.indexOf('!') === 0) {
          this.sortOrder = -1;
          this.sortField = sortField.substr(1);
        } else {
          this.sortOrder = 1;
          this.sortField = sortField;
        }
      }
    );
    this.rowsSubscription = this.libraryDisplayAdaptor.rows$.subscribe(rows => {
      this.rows = rows;
      this.fireLoadPage();
    });
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
    this.readingListsSubscription = this.readingListAdaptor.reading_list$.subscribe(
      reading_lists => (this.readingLists = reading_lists)
    );
    this.readingListAdaptor.get_reading_lists();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.contextMenuItemsSubscription.unsubscribe();
    this.mouseEventSubscription.unsubscribe();
    this.layoutSubscription.unsubscribe();
    this.sortFieldSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
    this.sameHeightSubscription.unsubscribe();
    this.coverSizeSubscription.unsubscribe();
    this.activatedRouteSubscription.unsubscribe();
    this.readingListsSubscription.unsubscribe();
    this.removeContextMenuItems();
  }

  @Input() set comics(comics: Comic[]) {
    this._comics = comics;
    this.toggleMenuItems();
  }

  get comics(): Comic[] {
    return this._comics;
  }

  @Input() set selectedComics(selectedComics: Comic[]) {
    this._selectedComics = selectedComics;
    this.toggleMenuItems();
  }

  get selectedComics(): Comic[] {
    return this._selectedComics;
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

  openComic(comic: Comic): void {
    this.selectionAdaptor.clearComicSelections();
    this.router.navigate(['/comics', comic.id]);
  }

  selectAll(): void {
    this.selectionAdaptor.selectComics(this._comics);
  }

  deselectAll(): void {
    this.selectionAdaptor.deselectComics(this._selectedComics);
  }

  scrapeComics(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant('comic-list.start-scraping.header'),
      message: this.translateService.instant(
        'comic-list.start-scraping.message',
        { count: this.selectedComics.length }
      ),
      accept: () => {
        this.scrapingAdaptor.startScraping(this.selectedComics);
        this.selectionAdaptor.clearComicSelections();
        this.router.navigateByUrl('/scraping');
      }
    });
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

  toggleComicSelection(comic: Comic, selected: boolean): void {
    if (!!comic) {
      if (selected) {
        this.selectionAdaptor.selectComic(comic);
      } else {
        this.selectionAdaptor.deselectComic(comic);
      }
    }
  }

  showFilters() {
    this.displayFilters = true;
  }

  setFilters(filters: LibraryFilter): void {
    this.filters = filters;
  }

  onLazyLoad(first: number): void {
    this.indexOfFirst = first;
    this.fireLoadPage();
  }

  private fireLoadPage(): void {
    this.loadPage.emit({
      page: Math.floor(this.indexOfFirst / this.rows),
      size: this.rows,
      sortField: this.sortField,
      ascending: this.sortOrder === 1 ? true : false
    });
  }

  hideContextMenu() {
    this.contextMenuAdaptor.hideMenu();
  }

  private addContextMenuItems() {
    this.contextMenuAdaptor.addItem(
      COMIC_LIST_MENU_SELECT_ALL,
      'fa fa-fw fa-plus',
      'comic-list.context-menu.select-all',
      false,
      true,
      () => this.selectAll()
    );
    this.contextMenuAdaptor.addItem(
      COMIC_LIST_MENU_DESELECT_ALL,
      'fa fa-fw fa-minus',
      'comic-list.context-menu.deselect-all',
      false,
      true,
      () => this.deselectAll()
    );
    this.contextMenuAdaptor.addItem(
      COMIC_LIST_MENU_DELETE_SELECTED,
      'fa fa-fw fa-trash',
      'comic-list.context-menu.delete-selected',
      false,
      true,
      () => this.deleteComics()
    );
    this.contextMenuAdaptor.addItem(
      COMIC_LIST_MENU_SCRAPE_SELECTED,
      'fa fa-fw fa-fingerprint',
      'comic-list.context-menu.scrape-selected',
      false,
      true,
      () => this.scrapeComics()
    );
    this.contextMenuAdaptor.addItem(
      COMIC_LIST_MENU_CONVERT_COMIC,
      'fa fa-fw fa-file-archive',
      'comic-list.context-menu.convert-comic',
      false,
      true,
      () => this.showConvertDialog()
    );
  }

  private removeContextMenuItems() {
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_SELECT_ALL);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_DESELECT_ALL);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_DELETE_SELECTED);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_SCRAPE_SELECTED);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_CONVERT_COMIC);
  }

  private toggleMenuItems() {
    const hasSelectedComics = this.selectedComics.length > 0;
    const allSelected = this.selectedComics.length === this.comics.length;

    if (hasSelectedComics) {
      if (allSelected) {
        this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_SELECT_ALL);
      } else {
        this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_SELECT_ALL);
      }
      this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_DESELECT_ALL);
      this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_DELETE_SELECTED);
      this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_SCRAPE_SELECTED);
      if (this.authenticationAdaptor.isAdmin) {
        this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_CONVERT_COMIC);
      }
    } else {
      this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_SELECT_ALL);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_DESELECT_ALL);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_DELETE_SELECTED);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_SCRAPE_SELECTED);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_CONVERT_COMIC);
    }
  }

  private showConvertDialog() {
    this.showConvertComics = true;
  }
}
