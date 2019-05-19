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
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Comic } from 'app/models/comics/comic';
import { LibraryFilter } from 'app/models/actions/library-filter';
import { LibraryDisplay } from 'app/models/state/library-display';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as LibraryActions from 'app/actions/library.actions';
import * as LibraryDisplayActions from 'app/actions/library-display.actions';
import * as UserActions from 'app/actions/user.actions';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ComicSelectionEntry } from 'app/models/ui/comic-selection-entry';

const FIRST = 'first';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.css']
})
export class ComicListComponent implements OnInit, OnDestroy {
  @Input() comics: Array<Comic>;
  @Input() selected_comics: Array<Comic> = [];
  @Input() library_filter: LibraryFilter;
  @Input() show_selections: boolean;

  @Output() selectionChange = new EventEmitter<ComicSelectionEntry>();

  private library_display$: Observable<LibraryDisplay>;
  private library_display_subscription: Subscription;
  library_display: LibraryDisplay;

  protected additional_sort_field_options: Array<SelectItem>;

  index_of_first = 0;

  constructor(
    private translate: TranslateService,
    private store: Store<AppState>,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
    this.library_display$ = this.store.select('library_display');
  }

  ngOnInit() {
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      }
    );
    this.load_additional_sort_field_options();
    this.activated_route.queryParams.subscribe((params: Params) => {
      if (params.first) {
        this.index_of_first = parseInt(params.first, 10);
      }
    });
  }

  ngOnDestroy() {
    this.library_display_subscription.unsubscribe();
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
    this.store.dispatch(
      new LibraryDisplayActions.SetLibraryViewLayout({ layout: layout })
    );
    this.store.dispatch(
      new UserActions.UserSetPreference({
        name: 'library_display_layout',
        value: layout
      })
    );
  }

  set_index_of_first(index: number): void {
    this.index_of_first = index;
    this.update_query_parameters(FIRST, `${index}`);
  }

  private update_query_parameters(name: string, value: string): void {
    const queryParams: Params = Object.assign(
      {},
      this.activated_route.snapshot.queryParams
    );
    queryParams[name] = value;
    this.router.navigate([], {
      relativeTo: this.activated_route,
      queryParams: queryParams
    });
  }
}
