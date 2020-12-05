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

import { Component, Input, OnInit } from '@angular/core';
import { Comic } from '@app/library';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '@angular-ru/logger';
import { ConfirmationService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cx-comic-edit',
  templateUrl: './comic-edit.component.html',
  styleUrls: ['./comic-edit.component.scss']
})
export class ComicEditComponent implements OnInit {
  private _comic: Comic;

  comicForm: FormGroup;

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.comicForm = this.formBuilder.group({
      publisher: [''],
      series: ['', [Validators.required]],
      volume: [''],
      issueNumber: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  @Input() set comic(comic: Comic) {
    this.logger.trace('Loading comic form:', comic);
    this._comic = comic;
    this.setInput('publisher', comic.publisher);
    this.setInput('series', comic.series);
    this.setInput('volume', comic.volume);
    this.setInput('issueNumber', comic.issueNumber);
    this.comicForm.updateValueAndValidity();
  }

  get comic(): Comic {
    return this._comic;
  }

  private setInput(controlName: string, value: any): void {
    this.logger.trace(`Setting form field: ${controlName}=${value}`);
    this.comicForm.controls[controlName].setValue(value);
  }

  onUndoChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic.undo-changes.title'),
      message: this.translateService.instant('comic.undo-changes.message'),
      confirm: () => {
        this.logger.trace('Undoing changes');
        this.comic = this._comic;
      }
    });
  }
}
