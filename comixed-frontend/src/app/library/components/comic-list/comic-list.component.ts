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
import {
  AppState,
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { LoadPageEvent } from 'app/library/models/ui/load-page-event';
import { AuthenticationAdaptor } from 'app/user';
import { generateContextMenuItems } from 'app/user-experience';
import { ContextMenuAdaptor } from 'app/user-experience/adaptors/context-menu.adaptor';
import { LoggerService } from '@angular-ru/logger';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { MenuItem } from 'primeng/components/common/menuitem';
import { ContextMenu } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import {
  COMIC_LIST_MENU_ADD_TO_READING_LIST,
  COMIC_LIST_MENU_CONVERT_COMIC,
  COMIC_LIST_MENU_DELETE_SELECTED,
  COMIC_LIST_MENU_DESELECT_ALL,
  COMIC_LIST_MENU_RESTORE_SELECTED,
  COMIC_LIST_MENU_SCRAPE_SELECTED,
  COMIC_LIST_MENU_SELECT_ALL
} from 'app/library/library.constants';
import { scrapeMultipleComics } from 'app/comics/actions/scrape-multiple-comic.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.scss']
})
export class ComicListComponent implements OnInit, OnDestroy {
  _comics: Comic[] = [];
  _selectedComics: Comic[] = [];

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
    private contextMenuAdaptor: ContextMenuAdaptor,
    private readingListAdaptor: ReadingListAdaptor,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
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
        this.store.dispatch(
          scrapeMultipleComics({ comics: this.selectedComics })
        );
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
      accept: () => {
        this.libraryAdaptor.deleteComics(
          this._selectedComics
            .filter(comic => !comic.deletedDate)
            .map(comic => comic.id)
        );
        this.selectionAdaptor.clearComicSelections();
      }
    });
  }

  restoreComics() {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-list.restore-comics.header',
        {
          count: this._selectedComics.length
        }
      ),
      message: this.translateService.instant(
        'comic-list.restore-comics.message'
      ),
      accept: () =>
        this.libraryAdaptor.undeleteComics(
          this._selectedComics
            .filter(comic => !!comic.deletedDate)
            .map(comic => comic.id)
        )
    });
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
      COMIC_LIST_MENU_RESTORE_SELECTED,
      'fa fa-fw fa-trash',
      'comic-list.context-menu.restore-selected',
      false,
      true,
      () => this.restoreComics()
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
    this.contextMenuAdaptor.addItem(
      COMIC_LIST_MENU_ADD_TO_READING_LIST,
      'fa fa-fw fa-list',
      'comic-list.context-menu.add-to-reading-list',
      true,
      false,
      () => this.readingListAdaptor.showSelectDialog()
    );
  }

  private removeContextMenuItems() {
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_SELECT_ALL);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_DESELECT_ALL);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_DELETE_SELECTED);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_RESTORE_SELECTED);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_SCRAPE_SELECTED);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_CONVERT_COMIC);
    this.contextMenuAdaptor.removeItem(COMIC_LIST_MENU_ADD_TO_READING_LIST);
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
      this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_RESTORE_SELECTED);
      this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_SCRAPE_SELECTED);
      if (this.authenticationAdaptor.isAdmin) {
        this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_CONVERT_COMIC);
      }
      this.contextMenuAdaptor.showItem(COMIC_LIST_MENU_ADD_TO_READING_LIST);
    } else {
      this.contextMenuAdaptor.enableItem(COMIC_LIST_MENU_SELECT_ALL);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_DESELECT_ALL);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_DELETE_SELECTED);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_RESTORE_SELECTED);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_SCRAPE_SELECTED);
      this.contextMenuAdaptor.disableItem(COMIC_LIST_MENU_CONVERT_COMIC);
      this.contextMenuAdaptor.hideItem(COMIC_LIST_MENU_ADD_TO_READING_LIST);
    }
  }

  showConvertDialog() {
    this.showConvertComics = true;
  }
}
