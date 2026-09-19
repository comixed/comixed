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

import { Component, inject, Input, OnInit } from '@angular/core';
import { ComicState } from '@app/comic-books/models/comic-state';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { updateComicBook } from '@app/comic-books/actions/comic-book.actions';
import { BehaviorSubject, filter, tap } from 'rxjs';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { Imprint } from '@app/comic-books/models/imprint';
import { selectImprints } from '@app/comic-books/selectors/imprint-list.selectors';
import { loadImprints } from '@app/comic-books/actions/imprint-list.actions';
import { ComicType } from '@app/comic-books/models/comic-type';
import { COMIC_TYPE_SELECTION_OPTIONS } from '@app/comic-books/comic-books.constants';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatLabel,
  MatSuffix
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';

@Component({
  selector: 'app-comic-detail-edit',
  templateUrl: './comic-detail-edit.component.html',
  styleUrls: ['./comic-detail-edit.component.scss'],
  imports: [
    CommonModule,
    MatToolbar,
    MatIconButton,
    MatTooltip,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    TranslateModule
  ]
})
export class ComicDetailEditComponent implements OnInit {
  @Input() isAdmin = false;

  comicForm: UntypedFormGroup;

  imprints$ = new BehaviorSubject<Imprint[]>([]);
  imprintOptions$ = new BehaviorSubject<SelectionOption<Imprint>[]>([]);
  readonly comicTypeOptions = COMIC_TYPE_SELECTION_OPTIONS;

  logger = inject(LoggerService);
  formBuilder = inject(UntypedFormBuilder);
  store = inject(Store);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  clipboard = inject(Clipboard);

  constructor() {
    this.logger.trace('Building comic book details form');
    this.comicForm = this.formBuilder.group({
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
      archiveType: [''],
      fileSize: [''],
      addedToLibrary: [''],
      notes: ['']
    });
    this.store
      .select(selectImprints)
      .pipe(
        filter(imprints => !!imprints),
        tap(imprints => {
          this.imprints$.next(imprints);
          this.doLoadImprint();
          this.imprintOptions$.next(
            [
              {
                label: '---',
                value: null
              } as SelectionOption<Imprint>
            ].concat(
              imprints.map(imprint => {
                return {
                  label: imprint.name,
                  value: imprint
                } as SelectionOption<Imprint>;
              })
            )
          );
        })
      )
      .subscribe();
  }

  private _comic: DisplayableComic;

  get comic(): DisplayableComic {
    const coverDate = this.comicForm.controls.coverDate.value
      ? new Date(this.comicForm.controls.coverDate.value).getTime()
      : null;
    const storeDate = this.comicForm.controls.storeDate.value
      ? new Date(this.comicForm.controls.storeDate.value).getTime()
      : null;
    return {
      ...this._comic,
      comicType: this.comicForm.controls.comicType.value,
      publisher: this.comicForm.controls.publisher.value,
      series: this.comicForm.controls.series.value,
      volume: this.comicForm.controls.volume.value,
      issueNumber: this.comicForm.controls.issueNumber.value,
      imprint: this.comicForm.controls.imprint.value,
      sortName: this.comicForm.controls.sortName.value,
      title: this.comicForm.controls.title.value,
      coverDate,
      storeDate,
      notes: this.comicForm.controls.notes.value
    } as DisplayableComic;
  }

  @Input() set comic(comic: DisplayableComic) {
    this._comic = comic;
    this.comicForm.controls.comicType.setValue(comic.comicType);
    this.comicForm.controls.publisher.setValue(comic.publisher);
    this.comicForm.controls.series.setValue(comic.series);
    this.comicForm.controls.volume.setValue(comic.volume);
    this.comicForm.controls.issueNumber.setValue(comic.issueNumber);
    this.comicForm.controls.imprint.setValue(comic.imprint);
    this.comicForm.controls.sortName.setValue(comic.sortName);
    this.comicForm.controls.title.setValue(comic.title);
    if (comic.coverDate) {
      this.comicForm.controls.coverDate.setValue(new Date(comic.coverDate));
    } else {
      this.comicForm.controls.coverDate.setValue(null);
    }
    if (comic.storeDate) {
      this.comicForm.controls.storeDate.setValue(new Date(comic.storeDate));
    } else {
      this.comicForm.controls.storeDate.setValue(null);
    }
    this.comicForm.controls.comicState.setValue(comic.comicState);
    this.comicForm.controls.filename.setValue(comic.filename);
    this.comicForm.controls.archiveType.setValue(comic.archiveType);
    this.comicForm.controls.fileSize.setValue(0);
    this.comicForm.controls.notes.setValue(comic.notes);
    this.comicForm.markAsUntouched();
  }

  get deleted(): boolean {
    return this.comic.comicState === ComicState.DELETED;
  }

  get comicChanged(): boolean {
    return !!this.comic && this.comic.comicState === ComicState.CHANGED;
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
        this.logger.debug('Saving changes to comic:', this.comic);
        this.store.dispatch(
          updateComicBook({
            comicId: this.comic.comicId,
            comicType: this.comicForm.controls.comicType.value,
            publisher: this.comicForm.controls.publisher.value,
            series: this.comicForm.controls.series.value,
            volume: this.comicForm.controls.volume.value,
            issueNumber: this.comicForm.controls.issueNumber.value,
            imprint: this.comicForm.controls.imprint.value?.name || null,
            sortName: this.comicForm.controls.sortName.value,
            title: this.comicForm.controls.title.value,
            storeDate: this.comicForm.controls.storeDate.value?.getTime(),
            coverDate: this.comicForm.controls.coverDate.value?.getTime()
          })
        );
      }
    });
  }

  onUndoChanges(): void {
    this.logger.debug('Resetting comic book changes');
    this.comic = this._comic;
  }

  onImprintSelected(imprint: Imprint): void {
    this.logger.info('Setting publisher name from imprint:', imprint);
    this.comicForm.controls.publisher.setValue(imprint?.publisher || '');
    this.logger.trace('Setting imprint name');
    this.comicForm.controls.imprint.setValue(imprint || null);
  }

  onComicTypeSelected(comicType: ComicType) {
    this.logger.trace('Setting comic type:', comicType);
    this.comicForm.controls.comicType.setValue(comicType);
  }

  onCopyFilenameToClipboard(): void {
    this.clipboard.copy(this.comic.filename);
  }

  private doLoadImprint() {
    this.comicForm.controls.imprint.setValue(this.comic.imprint);
  }
}
