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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Comic } from '@app/comic-books/models/comic';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '@angular-ru/logger';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { TranslateService } from '@ngx-translate/core';
import { ScrapeEvent } from '@app/comic-books/models/ui/scrape-event';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  API_KEY_PREFERENCE,
  MAXIMUM_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { updateComic } from '@app/comic-books/actions/comic.actions';
import { Subscription } from 'rxjs';
import { selectImprints } from '@app/comic-books/selectors/imprint-list.selectors';
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { loadImprints } from '@app/comic-books/actions/imprint-list.actions';
import { Imprint } from '@app/comic-books/models/imprint';

@Component({
  selector: 'cx-comic-edit',
  templateUrl: './comic-edit.component.html',
  styleUrls: ['./comic-edit.component.scss']
})
export class ComicEditComponent implements OnInit, OnDestroy {
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
  imprintSubscription: Subscription;
  imprintOptions: SelectionOption<Imprint>[] = [];
  imprints: Imprint[];

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
      issueNumber: ['', [Validators.required]],
      comicVineId: ['', [Validators.pattern('[0-9]+')]],
      imprint: [''],
      sortName: [''],
      title: [''],
      description: ['']
    });
    this.imprintSubscription = this.store
      .select(selectImprints)
      .subscribe(imprints => {
        this.logger.trace('Loading imprint options');
        this.imprints = imprints;
        this.imprintOptions = [
          {
            label: this.translateService.instant('text.clear-value'),
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
    this.logger.trace('Loading form fields');
    this.comicForm.controls.comicVineId.setValue(comic.comicVineId);
    this.comicForm.controls.publisher.setValue(comic.publisher);
    this.comicForm.controls.series.setValue(comic.series);
    this.comicForm.controls.volume.setValue(comic.volume);
    this.comicForm.controls.issueNumber.setValue(comic.issueNumber);
    this.comicForm.controls.imprint.setValue(comic.imprint);
    this.comicForm.controls.sortName.setValue(comic.sortName);
    this.comicForm.controls.title.setValue(comic.title);
    this.comicForm.controls.description.setValue(comic.description);
    this.comicForm.updateValueAndValidity();
  }

  get hasApiKey(): boolean {
    const apiKey = this.comicForm.controls.apiKey.value;
    return !!apiKey && apiKey.length > 0;
  }

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.logger.trace('Loading imprints');
    this.store.dispatch(loadImprints());
  }

  onUndoChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic-book.undo-changes.title'),
      message: this.translateService.instant('comic-book.undo-changes.message'),
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

  onSaveChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic-book.save-changes.title'),
      message: this.translateService.instant('comic-book.save-changes.message'),
      confirm: () => {
        const comic = this.encodeForm();
        this.logger.debug('Saving changes to comic:', comic);
        this.store.dispatch(updateComic({ comic }));
      }
    });
  }

  onImprintSelected(name: string): void {
    this.logger.trace('Finding imprint');
    const imprint = this.imprints.find(entry => entry.name === name);
    this.logger.trace('Setting publisher name');
    this.comicForm.controls.publisher.setValue(
      imprint?.publisher || this.comic.publisher
    );
    this.logger.trace('Setting imprint name');
    this.comicForm.controls.imprint.setValue(
      imprint?.name || this.comic.imprint
    );
  }

  private encodeForm(): Comic {
    this.logger.trace('Encoding comic');
    return {
      ...this.comic,
      publisher: this.comicForm.controls.publisher.value,
      series: this.comicForm.controls.series.value,
      volume: this.comicForm.controls.volume.value,
      issueNumber: this.comicForm.controls.issueNumber.value,
      imprint: this.comicForm.controls.imprint.value,
      sortName: this.comicForm.controls.sortName.value,
      title: this.comicForm.controls.title.value,
      description: this.comicForm.controls.description.value
    } as Comic;
  }
}
