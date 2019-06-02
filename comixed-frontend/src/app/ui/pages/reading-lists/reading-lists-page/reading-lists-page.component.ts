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
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Router } from '@angular/router';
import * as ReadingListActions from 'app/actions/reading-list.actions';
import { ReadingListState } from 'app/models/state/reading-list-state';

@Component({
  selector: 'app-reading-lists-page',
  templateUrl: './reading-lists-page.component.html',
  styleUrls: ['./reading-lists-page.component.css']
})
export class ReadingListsPageComponent implements OnInit, OnDestroy {
  reading_list_state$: Observable<ReadingListState>;
  reading_list_state_subscription: Subscription;
  reading_list_state: ReadingListState;

  constructor(private store: Store<AppState>, private router: Router) {
    this.reading_list_state$ = this.store.select('reading_lists');
  }

  ngOnInit() {
    this.reading_list_state_subscription = this.reading_list_state$.subscribe(
      (reading_list_state: ReadingListState) => {
        this.reading_list_state = reading_list_state;
      }
    );
    this.store.dispatch(new ReadingListActions.ReadingListGetAll());
  }

  ngOnDestroy(): void {
    this.reading_list_state_subscription.unsubscribe();
  }

  create_new_reading_list(): void {
    this.router.navigateByUrl('/lists/new');
  }
}
