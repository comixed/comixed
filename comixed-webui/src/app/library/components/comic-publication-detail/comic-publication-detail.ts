/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal
} from '@angular/core';
import { Comic } from '@app/library/models/comic';
import { Card } from '@openng/optimus-ui/card';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { IftaLabel } from '@openng/optimus-ui/iftalabel';
import { InputText } from '@openng/optimus-ui/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@openng/optimus-ui/button';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { DatePicker } from '@openng/optimus-ui/datepicker';
import { Fluid } from '@openng/optimus-ui/fluid';

@Component({
  imports: [
    Card,
    ReactiveFormsModule,
    IftaLabel,
    InputText,
    TranslatePipe,
    Button,
    Skeleton,
    DatePicker,
    Fluid
  ],
  selector: 'app-comic-publication-detail',
  styleUrl: './comic-publication-detail.scss',
  templateUrl: './comic-publication-detail.html'
})
export class ComicPublicationDetail {
  @Output() updateComic = new EventEmitter<Comic>();
  readonly isLoading = signal(false);
  readonly logger = inject(LoggerService);
  readonly formBuilder = inject(FormBuilder);
  publicationForm!: FormGroup;

  constructor() {
    this.logger.trace('Creating publication form');
    this.publicationForm = this.formBuilder.group({
      publisher: new FormControl(''),
      imprint: new FormControl(''),
      series: new FormControl(''),
      volume: new FormControl(''),
      issueNumber: new FormControl(''),
      coverDate: new FormControl<Date | null>(null),
      storeDate: new FormControl<Date | null>(null),
      addedDate: new FormControl<Date | null>({ value: null, disabled: true })
    });
  }

  @Input() set loading(loading: boolean) {
    this.isLoading.set(loading);
  }

  private _comic!: Comic;

  get comic(): Comic {
    return this._comic;
  }

  @Input() set comic(comic: Comic) {
    this._comic = comic;
    this.publicationForm.controls['publisher'].setValue(comic.publisher);
    this.publicationForm.controls['imprint'].setValue(comic.imprint);
    this.publicationForm.controls['series'].setValue(comic.series);
    this.publicationForm.controls['volume'].setValue(comic.volume);
    this.publicationForm.controls['issueNumber'].setValue(comic.issueNumber);
    this.publicationForm.controls['coverDate'].setValue(
      Number(comic.coverDate) ? new Date(comic.coverDate as number) : null
    );
    this.publicationForm.controls['storeDate'].setValue(
      Number(comic.storeDate) ? new Date(comic.storeDate as number) : null
    );
    this.publicationForm.controls['addedDate'].setValue(
      Number(comic.addedDate) ? new Date(comic.addedDate as number) : null
    );
  }

  onUpdateComic(): void {
    const comic = {
      ...this.comic,
      publisher: this.publicationForm.controls['publisher'].value,
      imprint: this.publicationForm.controls['imprint'].value,
      series: this.publicationForm.controls['series'].value,
      volume: this.publicationForm.controls['volume'].value,
      issueNumber: this.publicationForm.controls['issueNumber'].value,
      coverDate: this.publicationForm.controls['coverDate'].value?.getTime(),
      storeDate: this.publicationForm.controls['storeDate'].value?.getTime()
    };
    this.logger.debug('Update comic button pushed:', comic);
    this.updateComic.emit(comic);
  }
}
