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
import { Subscription } from 'rxjs';
import { ReadingList } from 'app/comics/models/reading-list';
import { LoggerService } from '@angular-ru/logger';
import { ReadingListAdaptor } from 'app/library';
import { filter } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reading-list-edit',
  templateUrl: './reading-list-edit.component.html',
  styleUrls: ['./reading-list-edit.component.scss']
})
export class ReadingListEditComponent implements OnInit, OnDestroy {
  readingListForm: FormGroup;

  editReadingListSubscription: Subscription;
  editingReadingList = false;
  readingListSubscription: Subscription;
  readingList: ReadingList = null;
  id = null;

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private readingListAdaptor: ReadingListAdaptor,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.readingListForm = this.formBuilder.group({
      name: ['', Validators.required],
      summary: ['']
    });
    this.editReadingListSubscription = this.readingListAdaptor.editingList$.subscribe(
      editing => (this.editingReadingList = editing)
    );
    this.readingListSubscription = this.readingListAdaptor.current$
      .pipe(filter(readingList => !!readingList))
      .subscribe(readingList => this.loadReadingList(readingList));
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.editReadingListSubscription.unsubscribe();
    this.readingListSubscription.unsubscribe();
  }

  private loadReadingList(readingList: ReadingList): void {
    this.id = readingList.id;
    this.readingListForm.controls['name'].setValue(readingList.name);
    this.readingListForm.controls['summary'].setValue(readingList.summary);
    this.readingListForm.markAsPristine();
  }

  saveReadingList() {
    const name = this.readingListForm.controls['name'].value;
    const summary = this.readingListForm.controls['summary'].value;
    this.confirmationService.confirm({
      header: this.translateService.instant('reading-list-edit.save.header'),
      message: this.translateService.instant('reading-list-edit.save.message', {
        name: name
      }),
      accept: () => this.readingListAdaptor.save(this.id, name, summary)
    });
  }

  cancelEditing() {
    this.readingListAdaptor.cancelEdit();
  }
}
