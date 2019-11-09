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
 * along with this program. If not, see <http://www.gnu.org/licenses>
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
import { Title } from '@angular/platform-browser';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-reading-list-page',
  templateUrl: './reading-list-page.component.html',
  styleUrls: ['./reading-list-page.component.scss']
})
export class ReadingListPageComponent implements OnInit, OnDestroy {
  selectedEntriesSubscription: Subscription;
  selectedEntries: Comic[];
  readingListSubscription: Subscription;
  readingList: ReadingList;
  langChangeSubscription: Subscription;

  entries: Comic[] = [];
  contextMenu: MenuItem[] = [];

  readingListForm: FormGroup;
  id = -1;

  constructor(
    private titleService: Title,
    private selectionAdaptor: SelectionAdaptor,
    private readingListAdaptor: ReadingListAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirm: ConfirmationService
  ) {
    this.readingListForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      summary: ['']
    });
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.id = +params['id'];
        this.readingListAdaptor.get_reading_list(this.id);
      } else {
        this.readingListAdaptor.create_reading_list();
      }
    });
    this.translateService.onLangChange.subscribe(() =>
      this.load_context_menu()
    );
    this.load_context_menu();
  }

  ngOnInit() {
    this.readingListSubscription = this.readingListAdaptor.current_list$
      .pipe(filter(state => !!state))
      .subscribe(reading_list => {
        this.readingList = reading_list;
        this.loadTranslations();
        this.titleService.setTitle(
          this.translateService.instant('reading-list-page.title', {
            name: this.readingList.name,
            count: (this.readingList.entries || []).length
          })
        );
        if (this.id === -1 && this.readingList.id) {
          this.router.navigate(['list', this.readingList.id]);
        } else {
          this.load_reading_list();
        }
      });
    this.selectedEntriesSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selected_entries => (this.selectedEntries = selected_entries)
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.readingListSubscription.unsubscribe();
    this.selectedEntriesSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private load_reading_list(): void {
    this.readingListForm.controls['name'].setValue(this.readingList.name);
    this.readingListForm.controls['summary'].setValue(
      this.readingList.summary || ''
    );
    this.readingListForm.markAsPristine();
    this.entries = [];
    (this.readingList.entries || []).forEach((entry: ReadingListEntry) =>
      this.entries.push(entry.comic)
    );
    this.selectedEntries = [];
  }

  submit_form(): void {
    this.readingListAdaptor.save(
      {
        id: this.id !== -1 ? this.id : undefined,
        name: this.readingListForm.controls['name'].value,
        summary: this.readingListForm.controls['summary'].value,
        entries: []
      } as ReadingList,
      this.readingList.entries
    );
  }

  load_context_menu(): void {
    this.contextMenu = [
      {
        label: 'Remove comics',
        icon: 'fa fa-fw fa-trash',
        command: () => {
          if (this.selectedEntries.length > 0) {
            this.remove_selected_comics();
          }
        }
      }
    ];
  }

  remove_selected_comics(): void {
    this.confirm.confirm({
      header: this.translateService.instant(
        'reading-list-page.remove-comics.header'
      ),
      message: this.translateService.instant(
        'reading-list-page.remove-comics.message',
        { comic_count: this.selectedEntries.length }
      ),
      accept: () => {
        const list_entries = this.entries.map(entry => {
          return { id: null, comic: entry } as ReadingListEntry;
        });
        this.readingListAdaptor.save(this.readingList, list_entries);
      }
    });
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      {
        label: this.translateService.instant(
          'breadcrumb.entry.reading-lists-page'
        ),
        routerLink: ['/lists']
      },
      {
        label: this.readingList.name
      }
    ]);
  }
}
