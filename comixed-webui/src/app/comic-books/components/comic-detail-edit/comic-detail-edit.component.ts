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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { LastRead } from '@app/last-read/models/last-read';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { updateComicBook } from '@app/comic-books/actions/comic-book.actions';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { FileDetails } from '@app/comic-books/models/file-details';
import { Subscription } from 'rxjs';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { Imprint } from '@app/comic-books/models/imprint';
import { selectImprints } from '@app/comic-books/selectors/imprint-list.selectors';
import { loadImprints } from '@app/comic-books/actions/imprint-list.actions';
import { ComicType } from '@app/comic-books/models/comic-type';

@Component({
  selector: 'cx-comic-detail-edit',
  templateUrl: './comic-detail-edit.component.html',
  styleUrls: ['./comic-detail-edit.component.scss']
})
export class ComicDetailEditComponent implements OnInit, OnDestroy {
  @Input() lastRead: LastRead;
  @Input() isAdmin = false;

  comicBookForm: UntypedFormGroup;

  imprintSubscription: Subscription;
  imprintOptions: SelectionOption<Imprint>[] = [];
  imprints: Imprint[];
  readonly comicTypeOptions: SelectionOption<ComicType>[] = [
    {
      label: 'comic-book.label.comic-type-issue',
      value: ComicType.ISSUE,
      selected: false
    },
    {
      label: 'comic-book.label.comic-type-trade-paperback',
      value: ComicType.TRADEPAPERBACK,
      selected: false
    },
    {
      label: 'comic-book.label.comic-type-manga',
      value: ComicType.MANGA,
      selected: false
    }
  ];

  constructor(
    private logger: LoggerService,
    private formBuilder: UntypedFormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Building comic book details form');
    this.comicBookForm = this.formBuilder.group({
      comicType: ['', Validators.required],
      publisher: ['', Validators.required],
      imprint: [''],
      series: ['', Validators.required],
      volume: ['', Validators.required],
      issueNumber: ['', Validators.required],
      title: [''],
      sortName: [''],
      coverDate: [''],
      storeDate: [''],
      comicState: [''],
      filename: [''],
      fileSize: [''],
      addedToLibrary: [''],
      notes: ['']
    });
    this.imprintSubscription = this.store
      .select(selectImprints)
      .subscribe(imprints => {
        this.logger.trace('Loading imprint options');
        this.imprints = imprints;
        this.imprintOptions = [
          {
            label: '---',
            value: { id: -1, name: '', publisher: '' }
          } as SelectionOption<Imprint>
        ].concat(
          imprints.map(imprint => {
            return {
              label: imprint.name,
              value: imprint
            } as SelectionOption<Imprint>;
          })
        );
      });
  }

  private _comicBook: ComicBook;

  get comicBook(): ComicBook {
    return {
      ...this._comicBook,
      detail: {
        ...this._comicBook.detail,
        id: undefined,
        comicType: this.comicBookForm.controls.comicType.value,
        publisher: this.comicBookForm.controls.publisher.value,
        series: this.comicBookForm.controls.series.value,
        volume: this.comicBookForm.controls.volume.value,
        issueNumber: this.comicBookForm.controls.issueNumber.value,
        coverDate: this.comicBookForm.controls.coverDate.value?.getTime(),
        storeDate: this.comicBookForm.controls.storeDate.value?.getTime(),
        imprint: this.comicBookForm.controls.imprint.value,
        sortName: this.comicBookForm.controls.sortName.value,
        title: this.comicBookForm.controls.title.value,
        notes: this.comicBookForm.controls.notes.value
      } as ComicDetail,
      fileDetails: {} as FileDetails
    } as ComicBook;
  }

  @Input() set comicBook(comic: ComicBook) {
    this._comicBook = comic;
    this.comicBookForm.controls.comicType.setValue(comic.detail.comicType);
    this.comicBookForm.controls.publisher.setValue(comic.detail.publisher);
    this.comicBookForm.controls.series.setValue(comic.detail.series);
    this.comicBookForm.controls.volume.setValue(comic.detail.volume);
    this.comicBookForm.controls.issueNumber.setValue(comic.detail.issueNumber);
    this.comicBookForm.controls.imprint.setValue(comic.detail.imprint);
    this.comicBookForm.controls.title.setValue(comic.detail.title);
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
    this.comicBookForm.controls.notes.setValue(comic.detail.notes);
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

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from imprint updates');
    this.imprintSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.trace('Loading imprints');
    this.store.dispatch(loadImprints());
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

  onImprintSelected(name: string): void {
    this.logger.trace('Finding imprint');
    const imprint = this.imprints.find(entry => entry.name === name);
    this.logger.trace('Setting publisher name');
    this.comicBookForm.controls.publisher.setValue(
      imprint?.publisher || this.comicBook.detail.publisher
    );
    this.logger.trace('Setting imprint name');
    this.comicBookForm.controls.imprint.setValue(
      imprint?.name || this.comicBook.detail.imprint
    );
  }

  onComicTypeSelected(comicType: ComicType) {
    this.logger.trace('Setting comic type:', comicType);
    this.comicBookForm.controls.comicType.setValue(comicType);
  }
}
