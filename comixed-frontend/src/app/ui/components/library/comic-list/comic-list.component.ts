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
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';
import { ReadingListAdaptor } from 'app/library/adaptors/reading-list.adaptor';

const FIRST = 'first';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.css']
})
export class ComicListComponent implements OnInit, OnDestroy {
  _comics: Comic[] = [];
  _selected_comics: Comic[] = [];
  _current_comic: Comic = null;
  reading_lists_subscription: Subscription;
  reading_lists: ReadingList[];

  @Input() library_filter: LibraryFilter;
  @Input() show_selections: boolean;

  translate_subscription: Subscription;

  protected additional_sort_field_options: Array<SelectItem>;

  index_of_first = 0;
  layout: string;
  sort_field: string;
  rows: number;
  same_height: boolean;
  cover_size: number;
  context_menu: MenuItem[];

  constructor(
    private auth_adaptor: AuthenticationAdaptor,
    private library_adaptor: LibraryAdaptor,
    private library_display_adaptor: LibraryDisplayAdaptor,
    private selection_adaptor: SelectionAdaptor,
    private reading_list_adaptor: ReadingListAdaptor,
    private translate: TranslateService,
    private confirm: ConfirmationService,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
    this.library_display_adaptor.layout$.subscribe(
      layout => (this.layout = layout)
    );
    this.library_display_adaptor.sort_field$.subscribe(
      sort_field => (this.sort_field = sort_field)
    );
    this.library_display_adaptor.rows$.subscribe(rows => (this.rows = rows));
    this.library_display_adaptor.same_height$.subscribe(
      same_height => (this.same_height = same_height)
    );
    this.library_display_adaptor.cover_size$.subscribe(
      cover_size => (this.cover_size = cover_size)
    );
  }

  ngOnInit() {
    this.load_additional_sort_field_options();
    this.activated_route.queryParams.subscribe((params: Params) => {
      if (params.first) {
        this.index_of_first = parseInt(params.first, 10);
      }
    });
    this.translate_subscription = this.translate.onLangChange.subscribe(() => {
      this.load_context_menu();
    });
    this.reading_lists_subscription = this.reading_list_adaptor.reading_list$.subscribe(
      reading_lists => (this.reading_lists = reading_lists)
    );
    this.reading_list_adaptor.get_reading_lists();
  }

  ngOnDestroy() {
    this.translate_subscription.unsubscribe();
    this.reading_lists_subscription.unsubscribe();
  }

  @Input() set comics(comics: Comic[]) {
    this._comics = comics;
    this.load_context_menu();
  }

  get comics(): Comic[] {
    return this._comics;
  }

  @Input() set selected_comics(selected_comics: Comic[]) {
    this._selected_comics = selected_comics;
    this.load_context_menu();
  }

  get selected_comics(): Comic[] {
    return this._selected_comics;
  }

  @Input() set current_comic(current_comic: Comic) {
    this._current_comic = current_comic;
    this.load_context_menu();
  }

  get current_comic(): Comic {
    return this._current_comic;
  }

  private load_additional_sort_field_options(): void {
    this.additional_sort_field_options = [
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.publisher'
        ),
        value: 'publisher'
      },
      {
        label: this.translate.instant(
          'comic-list-toolbar.options.sort-field.series'
        ),
        value: 'series'
      }
    ];
  }

  set_layout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
    this.library_display_adaptor.set_layout(layout);
    this.layout = layout;
  }

  set_index_of_first(index: number): void {
    this.index_of_first = index;
  }

  private load_context_menu() {
    this.context_menu = [
      {
        label: this.translate.instant('comic-list.popup.open-comic'),
        command: () => this.open_comic(this._selected_comics[0]),
        icon: 'fas fa-book-open',
        visible: this._selected_comics.length === 1
      },
      {
        label: this.translate.instant('comic-list.popup.select-all'),
        command: () => this.select_all(),
        icon: 'fas fa-check-double',
        visible: this._comics.length > 0
      },
      {
        label: this.translate.instant('comic-list.popup.deselect-all'),
        command: () => this.deselect_all(),
        icon: 'fas fa-broom',
        visible: this._selected_comics.length > 0
      },
      {
        label: this.translate.instant('comic-list.popup.scrape-comics'),
        command: () => this.scrape_comics(),
        icon: 'fas fa-cloud',
        visible: this._selected_comics.length > 0
      },
      {
        label: this.translate.instant('comic-list.popup.delete-comics'),
        command: () => this.delete_comics(),
        icon: 'fas fa-trash',
        visible: this._selected_comics.length > 0
      }
    ];

    if (this.reading_lists) {
      this.context_menu.push({ separator: true });
      const reading_lists = [];
      this.reading_lists.forEach((reading_list: ReadingList) => {
        reading_lists.push({
          label: reading_list.name,
          icon: 'fa fa-fw fa-plus',
          visible: !this.all_in_reading_list(reading_list),
          command: () => this.add_to_reading_list(reading_list)
        });
        reading_lists.push({
          label: reading_list.name,
          icon: 'fa fa-fw fa-minus',
          visible: this.already_in_reading_list(reading_list),
          command: () => this.remove_from_reading_list(reading_list)
        });
      });
      this.context_menu.push({
        label: this.translate.instant('comic-list.popup.reading-lists'),
        items: reading_lists
      });
    }
  }

  open_comic(comic: Comic): void {
    this.router.navigate(['/comics', comic.id]);
  }

  select_all(): void {
    this.selection_adaptor.select_comics(this._comics);
  }

  deselect_all(): void {
    this.selection_adaptor.deselect_comics(this._selected_comics);
  }

  scrape_comics(): void {
    this.router.navigate(['/scraping']);
  }

  delete_comics(): void {
    this.confirm.confirm({
      header: this.translate.instant('comic-list.delete-comics.header', {
        count: this._selected_comics.length
      }),
      message: this.translate.instant('comic-list.delete-comics.message'),
      accept: () =>
        this.library_adaptor.delete_comics_by_id(
          this._selected_comics.map(comic => comic.id)
        )
    });
  }

  add_to_reading_list(reading_list: ReadingList): void {
    const entries = reading_list.entries;
    this.selected_comics.forEach((comic: Comic) => {
      if (
        !entries.find((entry: ReadingListEntry) => entry.comic.id === comic.id)
      ) {
        entries.push({ id: null, comic: comic });
      }
    });

    this.save_reading_list(reading_list, entries);
  }

  remove_from_reading_list(reading_list: ReadingList): void {
    this.confirm.confirm({
      header: this.translate.instant(
        'comic-list.remove-from-reading-list.header'
      ),
      message: this.translate.instant(
        'comic-list.remove-from-reading-list.message',
        { reading_list_name: reading_list.name }
      ),
      accept: () => {
        const entries = reading_list.entries.filter(
          (entry: ReadingListEntry) => {
            return !this.selected_comics.some(
              comic => comic.id === entry.comic.id
            );
          }
        );
        this.save_reading_list(reading_list, entries);
      }
    });
  }

  save_reading_list(
    reading_list: ReadingList,
    entries: ReadingListEntry[]
  ): void {
    this.reading_list_adaptor.save(reading_list, entries);
  }

  already_in_reading_list(reading_list: ReadingList): boolean {
    const result = reading_list.entries.some((entry: ReadingListEntry) => {
      return this.selected_comics.some((comic: Comic) => {
        return comic.id === entry.comic.id;
      });
    });

    return result;
  }

  all_in_reading_list(reading_list: ReadingList): boolean {
    const result = reading_list.entries.some((entry: ReadingListEntry) => {
      return this.selected_comics.every((comic: Comic) => {
        return comic.id === entry.comic.id;
      });
    });

    return result;
  }
}
