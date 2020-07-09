/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import {
  LibraryAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { ReadingList } from 'app/comics/models/reading-list';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { Comic } from 'app/comics';

@Component({
  selector: 'app-add-comics-to-reading-list',
  templateUrl: './add-comics-to-reading-list.component.html',
  styleUrls: ['./add-comics-to-reading-list.component.scss']
})
export class AddComicsToReadingListComponent implements OnInit, OnDestroy {
  readingListForm: FormGroup;
  showDialogSubscription: Subscription;
  showDialog = false;
  readingListsSubscription: Subscription;
  readingLists: ReadingList[];
  readingListOptions: SelectItem[] = [];
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[] = [];
  addingComicsSubscription: Subscription;
  addingComics = false;
  comicsAddedSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private readingListAdaptor: ReadingListAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor
  ) {
    this.readingListForm = this.formBuilder.group({
      readingLists: ['', Validators.required]
    });
    this.showDialogSubscription = this.readingListAdaptor.showSelectionDialog$.subscribe(
      show => (this.showDialog = show)
    );
    this.readingListsSubscription = this.libraryAdaptor.lists$.subscribe(
      readingLists => {
        this.readingListOptions = readingLists.map(readingList => {
          return {
            label: readingList.name,
            value: readingList
          } as SelectItem;
        });
      }
    );
    this.selectedComicsSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      selected => (this.selectedComics = selected)
    );
    this.addingComicsSubscription = this.readingListAdaptor.addingComics$.subscribe(
      adding => (this.addingComics = adding)
    );
    this.comicsAddedSubscription = this.readingListAdaptor.comicsAdded$.subscribe(
      added => {
        if (added) {
          this.readingListAdaptor.hideSelectDialog();
        }
      }
    );
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.showDialogSubscription.unsubscribe();
    this.readingListsSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
    this.addingComicsSubscription.unsubscribe();
    this.comicsAddedSubscription.unsubscribe();
  }

  readingListSelected() {
    this.readingListAdaptor.addComicsToList(
      this.readingListForm.controls['readingLists'].value,
      this.selectedComics
    );
  }

  hideDialog() {
    this.readingListAdaptor.hideSelectDialog();
  }
}
