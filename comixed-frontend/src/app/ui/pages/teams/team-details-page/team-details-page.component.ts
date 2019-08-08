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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Comic } from 'app/models/comics/comic';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { LibraryState } from 'app/models/state/library-state';
import { TranslateService } from '@ngx-translate/core';
import { SelectionState } from 'app/models/state/selection-state';

@Component({
  selector: 'app-team-details-page',
  templateUrl: './team-details-page.component.html',
  styleUrls: ['./team-details-page.component.css']
})
export class TeamDetailsPageComponent implements OnInit, OnDestroy {
  library$: Observable<LibraryState>;
  library_subscription: Subscription;
  library: LibraryState;

  selection_state$: Observable<SelectionState>;
  selection_state_subscription: Subscription;
  selection_state: SelectionState;

  protected layout = 'grid';
  protected sort_field = 'volume';
  protected rows = 10;
  protected same_height = true;
  protected cover_size = 200;

  team_name: string;
  comics: Array<Comic> = [];
  selected_comics: Array<Comic> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private store: Store<AppState>
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.team_name = params['name'];
    });
    this.library$ = store.select('library');
    this.selection_state$ = store.select('selections');
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe(
      (library: LibraryState) => {
        this.library = library;

        if (this.library) {
          this.comics = [].concat(this.library.comics);
        }
      }
    );
    this.selection_state_subscription = this.selection_state$.subscribe(
      (selection_state: SelectionState) => {
        this.selection_state = selection_state;

        this.selected_comics = [].concat(this.selection_state.selected_comics);
      }
    );
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
    this.selection_state_subscription.unsubscribe();
  }

  set_layout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
  }

  set_sort_field(sort_field: string): void {
    this.sort_field = sort_field;
  }

  set_rows(rows: number): void {
    this.rows = rows;
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  set_same_height(same_height: boolean): void {
    this.same_height = same_height;
  }
}
