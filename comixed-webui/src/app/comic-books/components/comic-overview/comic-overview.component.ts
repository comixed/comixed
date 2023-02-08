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

import { Component, Input } from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { LastRead } from '@app/last-read/models/last-read';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { LoggerService } from '@angular-ru/cdk/logger';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { updateComicBook } from '@app/comic-books/actions/comic-book.actions';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { FileDetails } from '@app/comic-books/models/file-details';

@Component({
  selector: 'cx-comic-overview',
  templateUrl: './comic-overview.component.html',
  styleUrls: ['./comic-overview.component.scss']
})
export class ComicOverviewComponent {
  @Input() lastRead: LastRead;
  @Input() isAdmin = false;

  comicBookForm: FormGroup;

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Building comic book details form');
    this.comicBookForm = this.formBuilder.group({
      publisher: ['', Validators.required],
      series: ['', Validators.required],
      volume: ['', Validators.required],
      issueNumber: ['', Validators.required],
      coverDate: [''],
      storeDate: [''],
      comicState: [''],
      filename: [''],
      fileSize: [''],
      addedToLibrary: [''],
      scrapingNotes: ['']
    });
  }

  private _comicBook: ComicBook;

  get comicBook(): ComicBook {
    return {
      ...this._comicBook,
      detail: {
        ...this._comicBook.detail,
        id: undefined,
        publisher: this.comicBookForm.controls.publisher.value,
        series: this.comicBookForm.controls.series.value,
        volume: this.comicBookForm.controls.volume.value,
        issueNumber: this.comicBookForm.controls.issueNumber.value,
        coverDate: this.comicBookForm.controls.coverDate.value.getTime(),
        storeDate: this.comicBookForm.controls.storeDate.value.getTime(),
        notes: this.comicBookForm.controls.scrapingNotes.value
      } as ComicDetail,
      fileDetails: {} as FileDetails
    } as ComicBook;
  }

  @Input() set comicBook(comic: ComicBook) {
    this._comicBook = comic;
    this.comicBookForm.controls.publisher.setValue(comic.detail.publisher);
    this.comicBookForm.controls.series.setValue(comic.detail.series);
    this.comicBookForm.controls.volume.setValue(comic.detail.volume);
    this.comicBookForm.controls.issueNumber.setValue(comic.detail.issueNumber);
    if (!!comic.detail.coverDate) {
      this.comicBookForm.controls.coverDate.setValue(
        new Date(comic.detail.coverDate)
      );
    } else {
      this.comicBookForm.controls.coverDate.setValue(null);
    }
    if (!!comic.detail.storeDate) {
      this.comicBookForm.controls.storeDate.setValue(
        new Date(comic.detail.storeDate)
      );
    } else {
      this.comicBookForm.controls.storeDate.setValue(null);
    }
    this.comicBookForm.controls.comicState.setValue(comic.detail.comicState);
    this.comicBookForm.controls.filename.setValue(comic.detail.filename);
    this.comicBookForm.controls.fileSize.setValue(0);
    this.comicBookForm.controls.scrapingNotes.setValue(comic.detail.notes);
    this.comicBookForm.markAsUntouched();
  }

  get deleted(): boolean {
    return this.comicBook.detail.comicState === ComicBookState.DELETED;
  }

  get comicChanged(): boolean {
    return (
      !!this.comicBook &&
      this.comicBook.detail.comicState === ComicBookState.CHANGED
    );
  }

  onSaveChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.save-changes.confirmation-title'
      ),
      message: this.translateService.instant(
        'comic-book.save-changes.confirmation-message'
      ),
      confirm: () => {
        const comicBook = this.comicBook;
        this.logger.debug('Saving changes to comic:', comicBook);
        this.store.dispatch(updateComicBook({ comicBook }));
      }
    });
  }

  onUndoChanges(): void {
    this.logger.debug('Resetting comic book changes');
    this.comicBook = this._comicBook;
  }
}
