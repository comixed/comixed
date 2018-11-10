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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Comic } from '../../../../comic/comic.model';
import { UserService } from '../../../../services/user.service';
import { ComicService } from '../../../../services/comic.service';

@Component({
  selector: 'app-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.css']
})
export class LibraryPageComponent implements OnInit {
  readonly PAGESIZE_PARAMETER = 'pagesize';
  readonly SORT_PARAMETER = 'sort';
  readonly COVER_PARAMETER = 'coversize';
  readonly GROUP_BY_PARAMETER = 'groupby';
  readonly TAB_PARAMETER = 'tab';
  readonly SEARCH_PARAMETER = 'search';

  protected comics: Array<Comic> = [];
  protected current_tab: number;
  protected page_size: number;
  protected cover_size: number;
  protected sort_order: number;
  protected group_by: number;
  protected title_search: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private user_service: UserService,
    private comic_service: ComicService,
  ) {
    activatedRoute.queryParams.subscribe(params => {
      this.current_tab = this.load_parameter(params[this.TAB_PARAMETER], 0);
      this.page_size = this.load_parameter(params[this.PAGESIZE_PARAMETER], 10);
      this.sort_order = this.load_parameter(params[this.SORT_PARAMETER], 0);
      this.cover_size = this.load_parameter(params[this.COVER_PARAMETER], 200);
      this.group_by = this.load_parameter(params[this.GROUP_BY_PARAMETER], 0);
      this.title_search = this.load_parameter(params[this.SEARCH_PARAMETER], '');
    });
  }

  ngOnInit() {
    this.comics = this.comic_service.all_comics_update.subscribe(
      (comics: Array<Comic>) => {
        this.comics = this.sort_comics(comics);
      }
    );
  }

  set_current_tab(event: any): void {
    this.current_tab = event.index;
    this.update_params(this.TAB_PARAMETER, `${this.current_tab}`);
  }

  set_comics_per_page(page_size: number): void {
    this.page_size = page_size;
    this.update_params(this.PAGESIZE_PARAMETER, `${this.page_size}`);
  }

  set_sort_order(sort_order: number): void {
    this.sort_order = sort_order;
    this.comics = this.sort_comics(this.comics);
    this.update_params(this.SORT_PARAMETER, `${this.sort_order}`);
  }

  set_search_text(search_text: string): void {
    this.title_search = search_text;
    this.update_params(this.SEARCH_PARAMETER, this.title_search);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
    this.update_params(this.COVER_PARAMETER, `${this.cover_size}`);
  }

  set_group_by(group_by: number): void {
    this.group_by = group_by;
    this.update_params(this.GROUP_BY_PARAMETER, `${this.group_by}`);
  }

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  private load_parameter(value: string, defvalue: any): any {
    if (value && value.length) {
      return parseInt(value, 10);
    }
    return defvalue;
  }
  private sort_comics(comics: Comic[]): Comic[] {
    comics.sort((comic1: Comic, comic2: Comic) => {
      switch (this.sort_order) {
        case 0: return this.sort_by_series_name(comic1, comic2);
        case 1: return this.sort_by_date_added(comic1, comic2);
        case 2: return this.sort_by_cover_date(comic1, comic2);
        case 3: return this.sort_by_last_read_date(comic1, comic2);
        default: console.log('Invalid sort value: ' + this.sort_order);
      }
      return 0;
    });
    return comics;
  }

  private sort_by_series_name(comic1: Comic, comic2: Comic): number {
    if (comic1.series !== comic2.series) {
      if (comic1.series < comic2.series) {
        return -1;
      } else {
        return 1;
      }
    } else if (comic1.volume !== comic2.volume) {
      if (comic1.volume < comic2.volume) {
        return -1;
      } else {
        return 1;
      }
    } else if (comic1.issue_number !== comic2.issue_number) {
      if (comic1.issue_number < comic2.issue_number) {
        return -1;
      } else {
        return 1;
      }
    }

    // if we're here then the fields are all equal
    return 0;
  }

  private sort_by_date_added(comic1: Comic, comic2: Comic): number {
    if (comic1.added_date < comic2.added_date) {
      return -1;
    }
    if (comic1.added_date > comic2.added_date) {
      return 1;
    }
    return 0;
  }

  private sort_by_cover_date(comic1: Comic, comic2: Comic): number {
    if (comic1.cover_date < comic2.cover_date) {
      return -1;
    }
    if (comic1.cover_date > comic2.cover_date) {
      return 1;
    }
    return 0;
  }

  private sort_by_last_read_date(comic1: Comic, comic2: Comic): number {
    if (comic1.last_read_date < comic2.last_read_date) {
      return -1;
    }
    if (comic1.last_read_date > comic2.last_read_date) {
      return 1;
    }
    return 0;
  }
}
