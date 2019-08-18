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
import { Observable, Subscription } from 'rxjs';
import { Comic } from 'app/library';
import { SelectionState } from 'app/models/state/selection-state';
import { LibraryAdaptor } from 'app/library';

@Component({
  selector: 'app-missing-comics-page',
  templateUrl: './missing-comics-page.component.html',
  styleUrls: ['./missing-comics-page.component.css']
})
export class MissingComicsPageComponent implements OnInit, OnDestroy {
  selection_state$: Observable<SelectionState>;
  selection_state_subscription: Subscription;
  selection_state: SelectionState;

  comics: Array<Comic> = [];
  selected_comics: Array<Comic> = [];

  library_subscription: Subscription;

  constructor(
    private library_adaptor: LibraryAdaptor,
    private store: Store<AppState>,
    private translate: TranslateService
  ) {
    this.selection_state$ = store.select('selections');
  }

  ngOnInit() {
    this.library_subscription = this.library_adaptor.comic$.subscribe(
      comics => (this.comics = comics)
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
  }
}
