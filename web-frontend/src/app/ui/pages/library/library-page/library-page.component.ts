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
import { Comic } from '../../../../models/comic.model';
import { UserService } from '../../../../services/user.service';
import { ComicService } from '../../../../services/comic.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.css']
})
export class LibraryPageComponent implements OnInit {
  readonly ROWS_PARAMETER = 'rows';
  readonly SORT_PARAMETER = 'sort';
  readonly COVER_PARAMETER = 'coversize';
  readonly GROUP_BY_PARAMETER = 'groupby';
  readonly TAB_PARAMETER = 'tab';

  protected comics: Array<Comic> = [];
  protected selected_comic: Comic;
  protected show_dialog = false;

  protected rows_options: Array<SelectItem>;
  protected rows: number;
  protected current_tab: number;
  protected cover_size: number;

  protected sort_options: Array<SelectItem>;
  protected sort_by: string;

  protected group_options: Array<SelectItem>;
  protected group_by: string;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private user_service: UserService,
    private comic_service: ComicService,
  ) {
    this.sort_options = [
      { label: 'Series', value: 'series' },
      { label: 'Date Added', value: 'added_date' },
      { label: 'Cover Date', value: 'cover_date' },
      { label: 'Last Read', value: 'last_read_date' },
    ];
    this.group_options = [
      { label: 'None', value: 'none' },
      { label: 'Series', value: 'series' },
      { label: 'Publisher', value: 'publisher' },
      { label: 'Year', value: 'year' },
    ];
    this.rows_options = [
      { label: '10 comics', value: 10 },
      { label: '25 comics', value: 25 },
      { label: '50 comics', value: 50 },
      { label: '100 comics', value: 100 },
    ];
  }

  ngOnInit() {
    this.activated_route.queryParams.subscribe(params => {
      this.current_tab = this.load_parameter(params[this.TAB_PARAMETER], 0);
      this.rows = this.load_parameter(params[this.ROWS_PARAMETER], 10);
      this.sort_by = params[this.SORT_PARAMETER] || 'series';
      this.cover_size = this.load_parameter(params[this.COVER_PARAMETER],
        parseInt(this.user_service.get_user_preference('cover_size', '200'), 10));
      this.group_by = params[this.GROUP_BY_PARAMETER] || 'none';
    });
    this.comic_service.all_comics_update.subscribe(
      (comics: Array<Comic>) => {
        this.comics = comics;
      });
  }

  set_selected_comic(event: Event, comic: Comic): void {
    this.selected_comic = comic;
    this.show_dialog = true;
    event.preventDefault();
  }

  hide_dialog(): void {
    this.show_dialog = false;
  }

  get_comic_title(comic: Comic): string {
    return `${comic.series ? comic.series : 'Unknown Series'} ` +
      `(${comic.volume ? 'v' + comic.volume : '???'}) ` +
      `${comic.issue_number ? '#' + comic.issue_number : ''}`;
  }

  get_cover_url(comic: Comic): string {
    return this.comic_service.get_cover_url_for_comic(comic);
  }

  set_current_tab(current_tab: number): void {
    this.current_tab = current_tab;
    this.update_params(this.TAB_PARAMETER, `${this.current_tab}`);
  }

  set_sort_order(sort_order: string): void {
    this.sort_by = sort_order;
    this.update_params(this.SORT_PARAMETER, `${this.sort_by}`);
  }

  set_group_by(group_by: string): void {
    this.group_by = group_by;
    this.update_params(this.GROUP_BY_PARAMETER, this.group_by);
  }

  set_rows(rows: string): void {
    this.rows = parseInt(rows, 10);
    this.update_params(this.ROWS_PARAMETER, `${this.rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.update_params(this.COVER_PARAMETER, `${this.cover_size}`);
    this.user_service.set_user_preference('cover_size', `${this.cover_size}`);
  }

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign({}, this.activated_route.snapshot.queryParams);
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], { relativeTo: this.activated_route, queryParams: queryParams });
  }

  private load_parameter(value: string, defvalue: any): any {
    if (value && value.length) {
      return parseInt(value, 10);
    }
    return defvalue;
  }
}
