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

import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { selectSingleComicScrapingEntries } from '@app/metadata/selectors/single-comic-scraping.selectors';
import { Comic, NO_COMIC } from '@app/library/models/comic';
import { Button } from '@openng/optimus-ui/button';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';
import {
  selectMetadataSourceListEntries,
  selectMetadataSourceListSelected
} from '@app/metadata/selectors/metadata-source-list.selectors';
import { MetadataSourceListActions } from '@app/metadata/actions/metadata-source-list.actions';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Card } from '@openng/optimus-ui/card';
import { InputText } from '@openng/optimus-ui/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IftaLabel } from '@openng/optimus-ui/iftalabel';
import { ScrapingVolumeTable } from '@app/library/components/scraping-volume-table/scraping-volume-table';
import { Select } from '@openng/optimus-ui/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MetadataSource } from '@app/metadata/models/metadata-source';
import { ScrapingIssue } from '@app/metadata/models/scraping-issue';
import { ConfirmationService } from '@openng/optimus-ui/api';
import { Checkbox } from '@openng/optimus-ui/checkbox';

@Component({
  imports: [
    Button,
    Card,
    InputText,
    ReactiveFormsModule,
    TranslatePipe,
    IftaLabel,
    ScrapingVolumeTable,
    Select,
    Checkbox
  ],
  selector: 'app-comic-metadata-detail',
  styleUrl: './comic-metadata-detail.scss',
  templateUrl: './comic-metadata-detail.html'
})
export class ComicMetadataDetail implements OnInit {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly confirmationService = inject(ConfirmationService);
  readonly translateService = inject(TranslateService);
  readonly metadataSource = this.store.selectSignal(
    selectMetadataSourceListSelected
  );
  readonly metadataSourceList = this.store.selectSignal(
    selectMetadataSourceListEntries
  );
  readonly scrapingVolumeEntries = this.store.selectSignal(
    selectSingleComicScrapingEntries
  );
  readonly comicDetail = signal(NO_COMIC);
  readonly formBuilder = inject(FormBuilder);

  readonly maximumRecordOptions: { label: string; value: number }[] = [
    { label: 'comic-metadata-detail.option.all-records', value: 0 },
    { label: 'comic-metadata-detail.option.100-records', value: 100 },
    { label: 'comic-metadata-detail.option.500-records', value: 500 },
    { label: 'comic-metadata-detail.option.1000-records', value: 1000 }
  ];

  scrapingForm: FormGroup;

  constructor() {
    this.logger.trace('Creating scraping form');
    this.scrapingForm = this.formBuilder.group({
      metadataSource: new FormControl(null, {
        validators: [Validators.required]
      }),
      publisher: new FormControl<number | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      series: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      volume: new FormControl(''),
      issueNumber: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      matchPublisher: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      maximumRecords: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      skipCache: new FormControl(false)
    });
    this.store
      .select(selectMetadataSourceListSelected)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: source => {
          this.logger.debug('Selected metadata source changed:', source);
          this.scrapingForm.controls['metadataSource'].setValue(
            source?.metadataSourceId || null
          );
        }
      });
  }

  @Input() set comic(comic: Comic) {
    this.comicDetail.set(comic);
    this.doLoadForm();
  }

  get issueNumber(): string {
    return this.scrapingForm.controls['issueNumber'].value;
  }

  get matchPublisher(): boolean {
    return this.scrapingForm.controls['matchPublisher'].value;
  }

  get maximumRecords(): number {
    return this.scrapingForm.controls['maximumRecords'].value;
  }

  get skipCache(): boolean {
    return this.scrapingForm.controls['skipCache'].value;
  }

  onSelectMetadataSource(source: MetadataSource | null) {
    this.store.dispatch(
      MetadataSourceListActions.setSelected({ selected: source })
    );
  }

  ngOnInit(): void {
    this.logger.trace('Loading metadata source list');
    this.store.dispatch(MetadataSourceListActions.load());
  }

  onIssueSelected(issue: ScrapingIssue): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-metadata-detail.issue-selected.confirmation-title'
      ),
      message: this.translateService.instant(
        'comic-metadata-detail.issue-selected.confirmation-message'
      ),
      accept: () => {
        this.logger.debug('Scraping comic using issue:', issue);
        this.store.dispatch(
          SingleComicScrapingActions.scrapeComic({
            metadataSource: this.metadataSource()!,
            comic: this.comicDetail(),
            issueId: issue.id,
            skipCache: this.skipCache
          })
        );
      }
    });
  }

  protected onResetForm(): void {
    this.logger.trace('Resetting form');
    this.doLoadForm();
  }

  protected onLoadVolumes(): void {
    const publisher = this.scrapingForm.controls['publisher'].value;
    const series = this.scrapingForm.controls['series'].value;
    const matchPublisher = this.matchPublisher;
    const maximumRecords = this.maximumRecords;
    const skipCache = this.skipCache;

    this.store.dispatch(
      SingleComicScrapingActions.loadVolumes({
        metadataSource: this.metadataSourceList()[0],
        publisher,
        series,
        matchPublisher,
        maximumRecords,
        skipCache
      })
    );
  }

  private doLoadForm() {
    this.logger.debug('Reloading form:', this.comicDetail());
    this.scrapingForm.controls['publisher'].setValue(
      this.comicDetail().publisher
    );
    this.scrapingForm.controls['series'].setValue(this.comicDetail().series);
    this.scrapingForm.controls['volume'].setValue(this.comicDetail().volume);
    this.scrapingForm.controls['issueNumber'].setValue(
      this.comicDetail().issueNumber
    );
  }
}
