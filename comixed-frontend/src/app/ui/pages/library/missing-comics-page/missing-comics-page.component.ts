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
import { AppState } from 'app/app.state';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { LibraryState } from 'app/models/state/library-state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Comic } from 'app/models/comics/comic';
import { LibraryDisplay } from 'app/models/state/library-display';
import { SelectionState } from 'app/models/state/selection-state';

@Component({
  selector: 'app-missing-comics-page',
  templateUrl: './missing-comics-page.component.html',
  styleUrls: ['./missing-comics-page.component.css']
})
export class MissingComicsPageComponent implements OnInit, OnDestroy {
  library$: Observable<LibraryState>;
  library_subscription: Subscription;
  library: LibraryState;

  selection_state$: Observable<SelectionState>;
  selection_state_subscription: Subscription;
  selection_state: SelectionState;

  private library_display$: Observable<LibraryDisplay>;
  private library_display_subscription: Subscription;
  library_display: LibraryDisplay;

  comics: Array<Comic> = [];
  selected_comics: Array<Comic> = [];

  constructor(
    private store: Store<AppState>,
    private translate: TranslateService
  ) {
    this.library$ = store.select('library');
    this.library_display$ = store.select('library_display');
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
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      }
    );
    this.selection_state_subscription = this.selection_state$.subscribe(
      (selection_state: SelectionState) => {
        this.selection_state = selection_state;
        this.selected_comics = [].concat(this.selection_state.selected_comics);
      }
    );
  }

  ngOnDestroy(): void {
    this.library_subscription.unsubscribe();
    this.library_display_subscription.unsubscribe();
  }
}
