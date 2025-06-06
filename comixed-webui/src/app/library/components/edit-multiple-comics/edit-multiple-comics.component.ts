/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { Imprint } from '@app/comic-books/models/imprint';
import { Store } from '@ngrx/store';
import { selectImprints } from '@app/comic-books/selectors/imprint-list.selectors';
import { loadImprints } from '@app/comic-books/actions/imprint-list.actions';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { COMIC_TYPE_SELECTION_OPTIONS } from '@app/comic-books/comic-books.constants';
import { ComicType } from '@app/comic-books/models/comic-type';

@Component({
  selector: 'cx-edit-multiple-comics',
  templateUrl: './edit-multiple-comics.component.html',
  styleUrls: ['./edit-multiple-comics.component.scss']
})
export class EditMultipleComicsComponent implements OnInit, OnDestroy {
  detailsForm: UntypedFormGroup;
  imprintSubscription: Subscription;
  imprintOptions: SelectionOption<Imprint>[] = [];
  imprints: Imprint[];
  readonly comicTypeOptions: SelectionOption<ComicType>[] = [
    {
      label: '---',
      value: null,
      selected: false
    } as SelectionOption<ComicType>
  ].concat(COMIC_TYPE_SELECTION_OPTIONS);

  constructor(
    private logger: LoggerService,
    private formBuilder: UntypedFormBuilder,
    private store: Store<any>,
    @Inject(MAT_DIALOG_DATA) comicBooks: ComicDetail[]
  ) {
    this.detailsForm = this.formBuilder.group({
      publisher: ['', [Validators.required, Validators.maxLength(255)]],
      series: ['', [Validators.required, Validators.maxLength(255)]],
      volume: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(4)]
      ],
      issueNumber: ['', [Validators.required, Validators.maxLength(16)]],
      imprint: ['', [Validators.required, Validators.maxLength(64)]],
      comicType: ['', [Validators.required]]
    });
    this.imprintSubscription = this.store
      .select(selectImprints)
      .subscribe(imprints => {
        this.logger.trace('Loading imprint options');
        this.imprints = imprints;
        this.imprintOptions = [
          {
            label: '---',
            value: { imprintId: -1, name: '', publisher: '' }
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
    this.comics = comicBooks;
  }

  private _comics: ComicDetail[] = [];

  get comics(): ComicDetail[] {
    return this._comics;
  }

  set comics(comics: ComicDetail[]) {
    this._comics = comics;
    this.detailsForm.controls.publisher.setValue(
      this.findOption(comics.map(comic => comic.publisher))
    );
    this.detailsForm.controls.series.setValue(
      this.findOption(comics.map(comic => comic.series))
    );
    this.detailsForm.controls.volume.setValue(
      this.findOption(comics.map(comic => comic.volume))
    );
    this.detailsForm.controls.issueNumber.setValue(
      this.findOption(comics.map(comic => comic.issueNumber))
    );
    this.detailsForm.controls.imprint.setValue(
      this.findOption(comics.map(comic => comic.imprint))
    );
    this.detailsForm.controls.comicType.setValue(
      this.findOption(
        comics.map(comic => comic.comicType),
        null
      )
    );
  }

  ngOnInit(): void {
    this.logger.trace('Loading imprints');
    this.store.dispatch(loadImprints());
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from imprint updates');
    this.imprintSubscription.unsubscribe();
  }

  onImprintSelected(name: string): void {
    this.logger.trace('Finding imprint');
    const imprint = this.imprints.find(entry => entry.name === name);
    this.logger.trace('Setting publisher name');
    this.detailsForm.controls.publisher.setValue(imprint.publisher);
    this.logger.trace('Setting imprint name');
    this.detailsForm.controls.imprint.setValue(imprint.name);
  }

  encodeDetails(): EditMultipleComics {
    return {
      publisher: this.detailsForm.controls.publisher.value,
      series: this.detailsForm.controls.series.value,
      volume: this.detailsForm.controls.volume.value,
      issueNumber: this.detailsForm.controls.issueNumber.value,
      imprint: this.detailsForm.controls.imprint.value,
      comicType: this.detailsForm.controls.comicType.value
    };
  }

  onComicTypeSelected(comicType: ComicType): void {
    this.logger.debug('Setting comic type:', comicType);
    this.detailsForm.controls.comicType.setValue(comicType);
  }

  private findOption(
    values: string[],
    defaultValue: string | null = ''
  ): string | null {
    const options = values
      .filter(value => !!value)
      .filter((value, index, self) => self.indexOf(value) === index);

    if (options.length === 1) {
      return options[0];
    } else {
      return defaultValue;
    }
  }
}
