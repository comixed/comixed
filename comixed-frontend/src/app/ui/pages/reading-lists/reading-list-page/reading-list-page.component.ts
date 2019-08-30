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
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  Comic,
  ReadingList,
  ReadingListEntry,
  SelectionAdaptor
} from 'app/library';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ReadingListAdaptor } from 'app/library/adaptors/reading-list.adaptor';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-reading-list-page',
  templateUrl: './reading-list-page.component.html',
  styleUrls: ['./reading-list-page.component.css']
})
export class ReadingListPageComponent implements OnInit, OnDestroy {
  selected_entries_subscription: Subscription;
  selected_entries: Comic[];
  reading_list_subscription: Subscription;
  reading_list: ReadingList;

  entries: Comic[] = [];
  context_menu: MenuItem[] = [];

  reading_list_form: FormGroup;
  id = -1;

  constructor(
    private selection_adaptor: SelectionAdaptor,
    private reading_list_adaptor: ReadingListAdaptor,
    private form_builder: FormBuilder,
    private translate: TranslateService,
    private activated_route: ActivatedRoute,
    private router: Router,
    private confirm: ConfirmationService
  ) {
    this.reading_list_form = this.form_builder.group({
      name: ['', [Validators.required]],
      summary: ['']
    });
    this.activated_route.params.subscribe(params => {
      if (params['id']) {
        this.id = +params['id'];
        this.reading_list_adaptor.get_reading_list(this.id);
      } else {
        this.reading_list_adaptor.create_reading_list();
      }
    });
    this.translate.onLangChange.subscribe(() => this.load_context_menu());
    this.load_context_menu();
  }

  ngOnInit() {
    this.reading_list_subscription = this.reading_list_adaptor.current_list$
      .pipe(filter(state => !!state))
      .subscribe(reading_list => {
        this.reading_list = reading_list;
        if (this.id === -1 && this.reading_list.id) {
          this.router.navigate(['list', this.reading_list.id]);
        } else {
          this.load_reading_list();
        }
      });
    this.selected_entries_subscription = this.selection_adaptor.comic_selection$.subscribe(
      selected_entries => (this.selected_entries = selected_entries)
    );
  }

  ngOnDestroy(): void {
    this.reading_list_subscription.unsubscribe();
    this.selected_entries_subscription.unsubscribe();
  }

  private load_reading_list(): void {
    this.reading_list_form.controls['name'].setValue(this.reading_list.name);
    this.reading_list_form.controls['summary'].setValue(
      this.reading_list.summary || ''
    );
    this.reading_list_form.markAsPristine();
    this.entries = [];
    (this.reading_list.entries || []).forEach((entry: ReadingListEntry) =>
      this.entries.push(entry.comic)
    );
    this.selected_entries = [];
  }

  submit_form(): void {
    this.reading_list_adaptor.save(
      this.reading_list,
      this.reading_list.entries
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
        const entries = this.reading_list.entries.filter(
          entry => !this.selected_entries.includes(entry.comic)
        );
        this.reading_list_adaptor.save(this.reading_list, entries);
      }
    });
  }
}
