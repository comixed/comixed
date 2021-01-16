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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comic } from '@app/library';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '@angular-ru/logger';
import { ConfirmationService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { ScrapeEvent } from '@app/library/models/ui/scrape-event';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  API_KEY_PREFERENCE,
  MAXIMUM_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';

@Component({
  selector: 'cx-comic-edit',
  templateUrl: './comic-edit.component.html',
  styleUrls: ['./comic-edit.component.scss']
})
export class ComicEditComponent implements OnInit {
  @Input() skipCache = false;
  @Input() maximumRecords = 0;
  @Input() multimode = false;

  @Output() scrape = new EventEmitter<ScrapeEvent>();

  readonly maximumRecordsOptions = [
    { value: 0, label: 'scraping.label.all-records' },
    { value: 100, label: 'scraping.label.100-records' },
    { value: 1000, label: 'scraping.label.1000-records' }
  ];
  comicForm: FormGroup;
  scrapingMode = false;

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.comicForm = this.formBuilder.group({
      apiKey: [''],
      publisher: [''],
      series: ['', [Validators.required]],
      volume: [''],
      issueNumber: ['', [Validators.required]]
    });
  }

  private _apiKey = '';

  get apiKey(): string {
    return this._apiKey;
  }

  @Input() set apiKey(apiKey: string) {
    this._apiKey = apiKey;
    this.comicForm.controls.apiKey.setValue(apiKey);
  }

  private _comic: Comic;

  get comic(): Comic {
    return this._comic;
  }

  @Input() set comic(comic: Comic) {
    this.logger.trace('Loading comic form:', comic);
    this._comic = comic;
    this.setInput('publisher', comic.publisher);
    this.setInput('series', comic.series);
    this.setInput('volume', comic.volume);
    this.setInput('issueNumber', comic.issueNumber);
    this.comicForm.updateValueAndValidity();
  }

  get hasApiKey(): boolean {
    const apiKey = this.comicForm.controls.apiKey.value;
    return !!apiKey && apiKey.length > 0;
  }

  ngOnInit(): void {}

  onUndoChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic.undo-changes.title'),
      message: this.translateService.instant('comic.undo-changes.message'),
      confirm: () => {
        this.logger.trace('Undoing changes');
        this.comic = this._comic;
        this.comicForm.markAsUntouched();
      }
    });
  }

  onFetchScrapingVolumes(): void {
    this.logger.trace('Loading scraping volumes');
    this.scrape.emit({
      apiKey: this.comicForm.controls.apiKey.value,
      series: this.comicForm.controls.series.value,
      volume: this.comicForm.controls.volume.value,
      issueNumber: this.comicForm.controls.issueNumber.value,
      maximumRecords: this.maximumRecords,
      skipCache: this.skipCache
    });
  }

  onSaveApiKey(): void {
    this.logger.trace('Saving the new API key');
    this.store.dispatch(
      saveUserPreference({
        name: API_KEY_PREFERENCE,
        value: this.comicForm.controls.apiKey.value
      })
    );
  }

  onResetApiKey(): void {
    this.logger.trace('Resetting the API key changes');
    this.comicForm.controls.apiKey.setValue(this.apiKey);
    this.comicForm.controls.apiKey.markAsUntouched();
  }

  onSkipCacheToggle(): void {
    this.logger.trace('Toggling skipping the cache');
    this.skipCache = this.skipCache === false;
    this.store.dispatch(
      saveUserPreference({
        name: SKIP_CACHE_PREFERENCE,
        value: `${this.skipCache}`
      })
    );
  }

  onMaximumRecordsChanged(maximumRecords: number): void {
    this.logger.trace('Changed maximum records');
    this.store.dispatch(
      saveUserPreference({
        name: MAXIMUM_RECORDS_PREFERENCE,
        value: `${maximumRecords}`
      })
    );
  }

  private setInput(controlName: string, value: any): void {
    this.logger.trace(`Setting form field: ${controlName}=${value}`);
    this.comicForm.controls[controlName].setValue(value);
  }
}
