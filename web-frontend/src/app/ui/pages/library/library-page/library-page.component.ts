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
import * as LibraryActions from '../../../../actions/library.actions';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Comic } from '../../../../models/comics/comic';
import * as UserActions from '../../../../actions/user.actions';
import { User } from '../../../../models/user/user';
import { Preference } from '../../../../models/user/preference';
import { UserService } from '../../../../services/user.service';
import { ComicService } from '../../../../services/comic.service';
import { ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import {
  LIBRARY_SORT,
  LIBRARY_ROWS,
  LIBRARY_COVER_SIZE,
  LIBRARY_CURRENT_TAB,
} from '../../../../models/user/preferences.constants';

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

  private user$: Observable<User>;
  private user_subscription: Subscription;
  user: User;

  private library$: Observable<Library>;
  private library_subscription: Subscription;
  library: Library;

  comics: Array<Comic>;
  selected_comic: Comic;
  protected show_dialog = false;

  rows_options: Array<SelectItem>;
  rows: number;

  sort_options: Array<SelectItem>;
  sort_by: string;

  group_options: Array<SelectItem>;
  group_by: string;

  cover_size: number;
  current_tab: number;

  protected busy = false;
  private first_time_user_sub = true;
  private first_time_query = true;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private user_service: UserService,
    private comic_service: ComicService,
    private confirm_service: ConfirmationService,
    private store: Store<AppState>,
  ) {
    this.user$ = store.select('user');
    this.library$ = store.select('library');
    this.activated_route.queryParams.subscribe(
      params => {
        /* TODO major code stink here
         * We need a better way to parse the query parameters
         * and the user preferences.
         */
        if (this.first_time_query) {
          this.first_time_query = false;
          this.sort_by = params[this.SORT_PARAMETER] || 'series';
          this.rows = parseInt(params[this.ROWS_PARAMETER] || '10', 10);
          this.cover_size = parseInt(params[this.COVER_PARAMETER] || '200', 10);
          this.current_tab = parseInt(params[this.TAB_PARAMETER] || '0', 10);
        }
      });
    this.sort_options = [
      { label: 'Series', value: 'series' },
      { label: 'Volume', value: 'volume', },
      { label: 'Issue #', value: 'issue_number', },
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
    this.user_subscription = this.user$.subscribe(
      (user: User) => {
        this.user = user;

        /* TODO this has code stink all over it.
         * There has to be a better way to avoid updating parameters after the initial
         * page load...
         */
        if (this.first_time_user_sub) {
          this.first_time_user_sub = false;
          this.sort_by = this.get_parameter(LIBRARY_SORT) || this.sort_by;
          this.rows = parseInt(this.get_parameter(LIBRARY_ROWS) || `${this.rows}`, 10);
          this.cover_size = parseInt(this.get_parameter(LIBRARY_COVER_SIZE) || `${this.cover_size}`, 10);
          this.current_tab = parseInt(this.get_parameter(LIBRARY_CURRENT_TAB) || `${this.current_tab}`, 10);
        }
      });
    this.library_subscription = this.library$.subscribe(
      (library: Library) => {
        this.library = library;
        this.comics = library.comics;
      });
  }

  ngOnDestroy() {
    this.user_subscription.unsubscribe();
    this.library_subscription.unsubscribe();
  }

  set_selected_comic(comic: Comic): void {
    this.selected_comic = comic;
    this.show_dialog = true;
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
    this.store.dispatch(new UserActions.UserSetPreference({
      name: LIBRARY_CURRENT_TAB,
      value: `${current_tab}`
    }));
    this.update_params(this.TAB_PARAMETER, `${current_tab}`);
  }

  set_sort_order(sort_order: string): void {
    this.store.dispatch(new UserActions.UserSetPreference({
      name: LIBRARY_SORT,
      value: sort_order,
    }));
    this.update_params(this.SORT_PARAMETER, sort_order);
  }

  set_group_by(group_by: string): void {
    this.group_by = group_by;
    this.update_params(this.GROUP_BY_PARAMETER, this.group_by);
  }

  set_rows(rows: number): void {
    this.store.dispatch(new UserActions.UserSetPreference({
      name: LIBRARY_ROWS,
      value: `${rows}`,
    }));
    this.update_params(this.ROWS_PARAMETER, `${rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.store.dispatch(new UserActions.UserSetPreference({
      name: LIBRARY_COVER_SIZE,
      value: `${cover_size}`,
    }));
    this.update_params(this.COVER_PARAMETER, `${cover_size}`);
  }

  delete_comic(comic: Comic): void {
    this.confirm_service.confirm({
      header: `Delete ${this.comic_service.get_label_for_comic(comic)}?`,
      message: 'Are you sure? This will not delete the file, only remove it from the library.',
      icon: 'fa fa-exclamation',
      accept: () => {
        this.store.dispatch(new LibraryActions.LibraryRemoveComic({ comic: comic }));
      }
    });
  }

  get_comic_title(comic: Comic): string {
    return `${comic.series || 'Unknown'} v${comic.volume || '????'} #${comic.issue_number || '??'}`;
  }

  open_comic(comic: Comic): void {
    this.router.navigate(['comics', `${comic.id}`]);
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

  private get_parameter(name: string): string {
    const which = this.user.preferences.find((preference: Preference) => {
      return preference.name === name;
    });

    if (which) {
      return which.value;
    } else {
      return null;
    }
  }
}
