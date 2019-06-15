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
import { Comic } from 'app/models/comics/comic';
import { ReadingListEntry } from 'app/models/reading-list-entry';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { SelectionState } from 'app/models/state/selection-state';

@Component({
  selector: 'app-reading-list-page',
  templateUrl: './reading-list-page.component.html',
  styleUrls: ['./reading-list-page.component.css']
})
export class ReadingListPageComponent implements OnInit, OnDestroy {
  reading_list_state$: Observable<ReadingListState>;
  reading_list_state_subscription: Subscription;
  reading_list_state: ReadingListState;

  selection_state$: Observable<SelectionState>;
  selection_state_subscription: Subscription;
  selection_state: SelectionState;

  entries: Comic[] = [];
  selected_entries: Comic[] = [];
  context_menu: MenuItem[] = [];

  reading_list_form: FormGroup;
  id = -1;

  constructor(
    private form_builder: FormBuilder,
    private store: Store<AppState>,
    private translate: TranslateService,
    private activated_route: ActivatedRoute,
    private router: Router,
    private confirm: ConfirmationService
  ) {
    this.reading_list_state$ = this.store.select('reading_lists');
    this.selection_state$ = store.select('selections');
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
    this.translate.onLangChange.subscribe(() => this.load_context_menu());
    this.load_context_menu();
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
    this.selection_state_subscription = this.selection_state$.subscribe(
      (selection_state: SelectionState) => {
        this.selection_state = selection_state;

        this.selected_entries = [].concat(this.selection_state.selected_comics);
      }
    );
  }

  ngOnDestroy(): void {
    this.reading_list_state_subscription.unsubscribe();
    this.selection_state_subscription.unsubscribe();
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
        this.entries = [];
        reading_list.entries.forEach((entry: ReadingListEntry) =>
          this.entries.push(entry.comic)
        );
        this.selected_entries = [];
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

  load_context_menu(): void {
    this.context_menu = [
      {
        label: 'Remove comics',
        icon: 'fa fa-fw fa-trash',
        command: () => {
          if (this.selected_entries.length > 0) {
            this.remove_selected_comics();
          }
        }
      }
    ];
  }

  remove_selected_comics(): void {
    this.confirm.confirm({
      header: this.translate.instant('reading-list-page.remove-comics.header'),
      message: this.translate.instant(
        'reading-list-page.remove-comics.message',
        { comic_count: this.selected_entries.length }
      ),
      accept: () => {
        const entries = this.reading_list_state.current_list.entries.filter(
          (entry: ReadingListEntry) => {
            return !this.selected_entries.includes(entry.comic);
          }
        );
        const reading_list = this.reading_list_state.current_list;
        this.store.dispatch(
          new ReadingListActions.ReadingListSave({
            reading_list: { ...reading_list, entries: entries }
          })
        );
      }
    });
  }
}
