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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { Library } from '../../../../models/library';
import { LibraryDisplay } from '../../../../models/library-display';
import * as LibraryActions from '../../../../actions/library.actions';
import * as LibraryDisplayActions from '../../../../actions/library-display.actions';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Comic } from '../../../../models/comic.model';
import { UserService } from '../../../../services/user.service';
import { ComicService } from '../../../../services/comic.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-library-page',
  templateUrl: './library-page.component.html',
  styleUrls: ['./library-page.component.css']
})
export class LibraryPageComponent implements OnInit, OnDestroy {
  readonly ROWS_PARAMETER = 'rows';
  readonly SORT_PARAMETER = 'sort';
  readonly COVER_PARAMETER = 'coversize';
  readonly GROUP_BY_PARAMETER = 'groupby';
  readonly TAB_PARAMETER = 'tab';

  private library$: Observable<Library>;
  private library_subscription: Subscription;
  private library: Library;

  private library_display$: Observable<LibraryDisplay>;
  private library_display_subscription: Subscription;

  library_display: LibraryDisplay;

  comics: Array<Comic>;
  selected_comic: Comic;
  protected show_dialog = false;

  rows_options: Array<SelectItem>;
  sort_options: Array<SelectItem>;
  group_options: Array<SelectItem>;
  group_by: string;

  protected busy = false;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private user_service: UserService,
    private comic_service: ComicService,
    private store: Store<AppState>,
  ) {
    this.library$ = store.select('library');
    this.library_display$ = store.select('library_display');
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
    this.library_subscription = this.library$.subscribe(
      (library: Library) => {
        this.comics = library.comics;
      });
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      });
    this.activated_route.queryParams.subscribe(params => {
      this.set_current_tab(this.load_parameter(params[this.TAB_PARAMETER],
        parseInt(this.user_service.get_user_preference('library_tab', '0'), 10)));
      this.set_sort_order(params[this.SORT_PARAMETER] || this.user_service.get_user_preference('library_sort', 'series'));
      this.set_rows(this.load_parameter(params[this.ROWS_PARAMETER],
        parseInt(this.user_service.get_user_preference('library_rows', '10'), 10)));
      this.set_cover_size(this.load_parameter(params[this.COVER_PARAMETER],
        parseInt(this.user_service.get_user_preference('cover_size', '200'), 10)));
    });
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
  }

  set_selected_comic(event: Event, comic: Comic): void {
    this.selected_comic = comic;
    this.show_dialog = true;
    event.preventDefault();
  }

  hide_dialog(): void {
    this.show_dialog = false;
  }

  get_download_link(comic: Comic): string {
    return this.comic_service.get_download_link_for_comic(comic.id);
  }

  get_cover_url(comic: Comic): string {
    return this.comic_service.get_cover_url_for_comic(comic);
  }

  set_current_tab(current_tab: number): void {
    this.store.dispatch(new LibraryDisplayActions.SetLibraryViewCurrentTab(current_tab));
    this.update_params(this.TAB_PARAMETER, `${current_tab}`);
  }

  set_sort_order(sort_order: string): void {
    this.store.dispatch(new LibraryDisplayActions.SetLibraryViewSort(sort_order));
    this.update_params(this.SORT_PARAMETER, sort_order);
  }

  set_group_by(group_by: string): void {
    this.group_by = group_by;
    this.update_params(this.GROUP_BY_PARAMETER, this.group_by);
  }

  set_rows(rows: number): void {
    this.store.dispatch(new LibraryDisplayActions.SetLibraryViewRows(rows));
    this.update_params(this.ROWS_PARAMETER, `${rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.store.dispatch(new LibraryDisplayActions.SetLibraryViewCoverSize(cover_size));
    this.update_params(this.COVER_PARAMETER, `${cover_size}`);
  }

  delete_comic(comic: Comic): void {
    this.comic_service.remove_comic_from_library(comic);
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
