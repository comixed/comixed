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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as ReadingListActions from 'app/actions/reading-list.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReadingListState } from 'app/models/state/reading-list-state';
import { ReadingList } from 'app/models/reading-list';
import { Library } from 'app/models/actions/library';
import * as LibraryActions from 'app/actions/library.actions';

@Component({
  selector: 'app-reading-list-page',
  templateUrl: './reading-list-page.component.html',
  styleUrls: ['./reading-list-page.component.css']
})
export class ReadingListPageComponent implements OnInit, OnDestroy {
  reading_list_state$: Observable<ReadingListState>;
  reading_list_state_subscription: Subscription;
  reading_list_state: ReadingListState;
  entries: Array<Comic>;

  reading_list_form: FormGroup;
  id = -1;

  constructor(
    private form_builder: FormBuilder,
    private store: Store<AppState>,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
    this.reading_list_state$ = this.store.select('reading_lists');
    this.reading_list_form = this.form_builder.group({
      name: ['', [Validators.required]],
      summary: ['']
    });
    this.activated_route.params.subscribe(params => {
      if (params['id']) {
        this.id = +params['id'];
        this.load_reading_list();
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(
      new ReadingListActions.ReadingListSetCurrent({ reading_list: null })
    );
    this.reading_list_state_subscription = this.reading_list_state$.subscribe(
      (reading_list_state: ReadingListState) => {
        this.reading_list_state = reading_list_state;
        if (this.reading_list_state.current_list) {
          if (this.id === -1 && this.reading_list_state.current_list.id) {
            this.router.navigate([
              'lists',
              this.reading_list_state.current_list.id
            ]);
          } else {
            this.load_reading_list();
          }
        } else {
          if (this.id === -1) {
            this.store.dispatch(new ReadingListActions.ReadingListCreate());
          } else {
            this.load_reading_list();
          }
        }
      }
    );
    this.store.dispatch(new ReadingListActions.ReadingListGetAll());
  }

  ngOnDestroy(): void {
    this.reading_list_state_subscription.unsubscribe();
  }

  private load_reading_list(): void {
    if (
      this.id !== -1 &&
      this.reading_list_state &&
      this.reading_list_state.reading_lists
    ) {
      const reading_list = this.reading_list_state.reading_lists.find(
        (entry: ReadingList) => entry.id === this.id
      );
      if (reading_list) {
        if (reading_list !== this.reading_list_state.current_list) {
          this.store.dispatch(
            new ReadingListActions.ReadingListSetCurrent({
              reading_list: reading_list
            })
          );
        }
        this.reading_list_form.controls['name'].setValue(reading_list.name);
        this.reading_list_form.controls['summary'].setValue(
          reading_list.summary || ''
        );
        this.reading_list_form.markAsPristine();
        this.entries = [].concat(reading_list.entries);
      }
    }
  }

  submit_form(): void {
    this.store.dispatch(
      new ReadingListActions.ReadingListSave({
        reading_list: {
          id: this.reading_list_state.current_list.id,
          owner: null,
          name: this.reading_list_form.controls['name'].value,
          summary: this.reading_list_form.controls['summary'].value,
          entries: this.reading_list_state.current_list.entries
        }
      })
    );
  }
}
