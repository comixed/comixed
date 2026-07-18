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

import { Component, HostListener, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import {
  selectMetadataSourceList,
  selectMetadataSourceListBusy
} from '@app/comic-metadata/selectors/metadata-source-list.selectors';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { loadMetadataSources } from '@app/comic-metadata/actions/metadata-source-list.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { loadVolumeMetadata } from '@app/comic-metadata/actions/single-book-scraping.actions';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import {
  selectScrapingVolumeMetadata,
  selectSingleBookScrapingBusy
} from '@app/comic-metadata/selectors/single-book-scraping.selectors';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import {
  MATCH_PUBLISHER_PREFERENCE,
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { scrapeSeriesMetadata } from '@app/comic-metadata/actions/scrape-series.actions';
import { selectScrapeSeriesBusy } from '@app/comic-metadata/selectors/scrape-series.selectors';
import { METADATA_RECORD_LIMITS } from '@app/comic-metadata/comic-metadata.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { VolumeMetadataTableComponent } from '../../../comic-books/components/volume-metadata-table/volume-metadata-table.component';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { VolumeMetadataTitlePipe } from '../../../comic-books/pipes/volume-metadata-title.pipe';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-scraping-series-page',
  templateUrl: './scraping-series-page.component.html',
  styleUrls: ['./scraping-series-page.component.scss'],
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon,
    MatTooltip,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    VolumeMetadataTableComponent,
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatButton,
    TranslateModule,
    VolumeMetadataTitlePipe,
    AsyncPipe
  ]
})
export class ScrapingSeriesPageComponent implements OnInit {
  readonly maximumRecordsOptions = METADATA_RECORD_LIMITS;
  maximumRecords = 0;

  scrapeSeriesForm: FormGroup;
  originalPublisher = '';
  originalSeries = '';
  originalVolume = '';

  metadataSourceListBusy$ = new BehaviorSubject(false);
  fetchIssuesForSeriesBusy$ = new BehaviorSubject(false);
  metadataBusy$ = new BehaviorSubject(false);
  scrapingVolumes$ = new BehaviorSubject<VolumeMetadata[]>([]);
  pageSize$ = new BehaviorSubject(10);
  metadataSourceList$ = new BehaviorSubject<MetadataSource[]>([]);
  selectedVolume: VolumeMetadata;

  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  formBuilder = inject(UntypedFormBuilder);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  confirmationService = inject(ConfirmationService);
  dialog = inject(MatDialog);

  constructor() {
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.logger.debug('Route parameters:', params);
          this.originalPublisher = params.publisher;
          this.originalSeries = params.series;
          this.originalVolume = params.volume;
        })
      )
      .subscribe();
    this.scrapeSeriesForm = this.formBuilder.group({
      publisher: [this.originalPublisher],
      series: [this.originalSeries],
      volume: [this.originalVolume],
      metadataSource: ['', Validators.required],
      skipCache: [''],
      matchPublisher: ['']
    });
    this.store
      .select(selectUser)
      .pipe(
        tap(user => {
          this.scrapeSeriesForm.controls.skipCache.setValue(
            getUserPreference(
              user.preferences,
              SKIP_CACHE_PREFERENCE,
              `${false}`
            ) === `${true}`
          );
          this.scrapeSeriesForm.controls.matchPublisher.setValue(
            getUserPreference(
              user.preferences,
              MATCH_PUBLISHER_PREFERENCE,
              `${false}`
            ) === `${true}`
          );
        })
      )
      .subscribe();
    this.store
      .select(selectMetadataSourceList)
      .pipe(
        tap(list => {
          this.logger.trace('Setting metadata source list');
          this.metadataSourceList$.next(list);
          this.metadataSource = this.metadataSourceList$.value.find(
            source => source.preferred
          );
        })
      )
      .subscribe();
    this.store
      .select(selectMetadataSourceListBusy)
      .pipe(
        tap(state => {
          this.metadataSourceListBusy$.next(state);
          this.updateBusyState();
        })
      )
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
    this.store
      .select(selectScrapingVolumeMetadata)
      .pipe(tap(volumes => this.scrapingVolumes$.next(volumes)))
      .subscribe();
    this.store
      .select(selectScrapeSeriesBusy)
      .pipe(
        tap(busy => {
          this.fetchIssuesForSeriesBusy$.next(busy);
          this.updateBusyState();
        })
      )
      .subscribe();
    this.store
      .select(selectSingleBookScrapingBusy)
      .pipe(
        tap(busy => {
          this.metadataBusy$.next(busy);
          this.updateBusyState();
        })
      )
      .subscribe();
    this.loadTranslations();
  }

  get publisher(): string {
    return this.scrapeSeriesForm.controls['publisher'].value;
  }

  get series(): string {
    return this.scrapeSeriesForm.controls['series'].value;
  }

  get volume(): string {
    return this.scrapeSeriesForm.controls['volume'].value;
  }

  get skipCache(): boolean {
    return this.scrapeSeriesForm.controls.skipCache.value;
  }

  set skipCache(skipCache: boolean) {
    this.store.dispatch(
      saveUserPreference({ name: SKIP_CACHE_PREFERENCE, value: `${skipCache}` })
    );
  }

  get matchPublisher(): boolean {
    return this.scrapeSeriesForm.controls.matchPublisher.value;
  }

  set matchPublisher(matchPublisher: boolean) {
    this.store.dispatch(
      saveUserPreference({
        name: MATCH_PUBLISHER_PREFERENCE,
        value: `${matchPublisher}`
      })
    );
  }

  get metadataSource(): MetadataSource {
    return this.metadataSourceList$.value.find(
      source =>
        source.metadataSourceId ===
        this.scrapeSeriesForm.controls.metadataSource.value
    );
  }

  set metadataSource(metadataSource: MetadataSource) {
    this.logger.debug(`Selected metadata source: ${metadataSource?.name}`);
    this.scrapeSeriesForm.controls.metadataSource.setValue(
      metadataSource?.metadataSourceId
    );
  }

  ngOnInit(): void {
    this.logger.trace('Fetching metadata source list');
    this.store.dispatch(loadMetadataSources());
    this.logger.trace('Clearing volumes');
    this.scrapingVolumes$.next([]);
  }

  onMetadataSourceSelected(id: number): void {
    this.logger.debug(`Selected metadata source: id=${id}`);
    this.metadataSource = this.metadataSourceList$.value.find(
      source => source.metadataSourceId === id
    );
  }

  onFetchVolumeCandidates(): void {
    const series = this.scrapeSeriesForm.controls['series'].value;
    const publisher = this.scrapeSeriesForm.controls['publisher'].value;
    this.logger.debug(
      `Fetching candidates for series: series=${series} source=${this.metadataSource}`
    );
    this.store.dispatch(
      loadVolumeMetadata({
        metadataSource: this.metadataSource,
        publisher,
        series,
        maximumRecords: this.maximumRecords,
        skipCache: this.skipCache,
        matchPublisher: this.matchPublisher
      })
    );
  }

  loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('scraping-series-page.tab-title', {
        publisher: this.originalPublisher,
        series: this.originalSeries,
        volume: this.originalVolume
      })
    );
  }

  updateBusyState(): void {
    const enabled =
      this.metadataSourceListBusy$.value ||
      this.metadataBusy$.value ||
      this.fetchIssuesForSeriesBusy$.value;
    this.store.dispatch(setBusyState({ enabled }));
  }

  onVolumeSelected(volume: VolumeMetadata): void {
    this.logger.debug('Volume selected:', volume);
    this.selectedVolume = volume;
  }

  onVolumeChosen(volume: VolumeMetadata): void {
    this.logger.debug('Volume chosen:', volume);
    this.confirmationService.confirm({
      title: this.translateService.instant('scrape-series.confirmation-title'),
      message: this.translateService.instant(
        'scrape-series.confirmation-message',
        {
          publisher: volume.publisher,
          series: volume.name,
          volume: volume.startYear
        }
      ),
      confirm: () => {
        this.logger.debug('Fetching issues for series');
        this.store.dispatch(
          scrapeSeriesMetadata({
            originalPublisher: this.originalPublisher,
            originalSeries: this.originalSeries,
            originalVolume: this.originalVolume,
            source: this.metadataSource,
            volume
          })
        );
      }
    });
  }

  onMaximumRecordsChanged(maximumRecords: number): void {
    this.logger.debug('Changed maximum records');
    this.store.dispatch(
      saveUserPreference({
        name: MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
        value: `${maximumRecords}`
      })
    );
  }

  onShowNotice(dialogTemplate: any): void {
    this.dialog.open(dialogTemplate, { width: '600px' });
  }

  @HostListener('window:keydown.shift.control.c', ['$event'])
  onHotKeySkipCacheToggle(event: KeyboardEvent): void {
    event.preventDefault();
    this.onSkipCacheToggle();
  }

  onSkipCacheToggle(): void {
    this.skipCache = this.skipCache === false;
  }

  @HostListener('window:keydown.shift.control.p', ['$event'])
  onHotKeyMatchPublisherToggle(event: KeyboardEvent): void {
    event.preventDefault();
    this.onMatchPublisherToggle();
  }

  onMatchPublisherToggle(): void {
    this.matchPublisher = this.matchPublisher === false;
  }
}
