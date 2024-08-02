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

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  selectMetadataSourceList,
  selectMetadataSourceListState
} from '@app/comic-metadata/selectors/metadata-source-list.selectors';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { loadMetadataSources } from '@app/comic-metadata/actions/metadata-source-list.actions';
import { setBusyState } from '@app/core/actions/busy.actions';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { MetadataSourceListState } from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { loadVolumeMetadata } from '@app/comic-metadata/actions/single-book-scraping.actions';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import {
  selectScrapingVolumeMetadata,
  selectSingleBookScrapingState
} from '@app/comic-metadata/selectors/single-book-scraping.selectors';
import { SingleBookScrapingState } from '@app/comic-metadata/reducers/single-book-scraping.reducer';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import {
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { scrapeSeriesMetadata } from '@app/comic-metadata/actions/series-scraping.actions';
import { SeriesScrapingState } from '@app/comic-metadata/reducers/series-scraping.reducer';
import { selectSeriesScrapingState } from '@app/comic-metadata/selectors/series-scraping.selectors';
import { METADATA_RECORD_LIMITS } from '@app/comic-metadata/comic-metadata.constants';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'cx-scraping-series-page',
  templateUrl: './scraping-series-page.component.html',
  styleUrls: ['./scraping-series-page.component.scss']
})
export class ScrapingSeriesPageComponent implements OnInit, OnDestroy {
  readonly maximumRecordsOptions = METADATA_RECORD_LIMITS;
  maximumRecords = 0;

  scrapeSeriesForm: UntypedFormGroup;
  originalPublisher = '';
  originalSeries = '';
  originalVolume = '';

  userSubscription: Subscription;
  paramSubscription: Subscription;
  metadataSourceListSubscription: Subscription;
  metadataSourceListStateSubscription: Subscription;
  metadataSourceListState: MetadataSourceListState;
  scrapingVolumeSubscription: Subscription;
  fetchIssuesForSeriesStateSubscription: Subscription;
  fetchIssuesForSeriesState: SeriesScrapingState;
  scrapingVolumes: VolumeMetadata[] = [];
  pageSize = 10;
  metadataStateSubscription: Subscription;
  metadataState: SingleBookScrapingState;
  busy = false;
  metadataSourceList: MetadataSource[] = [];
  langChangeSubscription: Subscription;
  selectedVolume: VolumeMetadata;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private translateService: TranslateService,
    private titleService: TitleService,
    private confirmationService: ConfirmationService,
    private dialog: MatDialog
  ) {
    this.logger.trace('Loading page parameters');
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.logger.debug('Route parameters:', params);
      this.originalPublisher = params.publisher;
      this.originalSeries = params.series;
      this.originalVolume = params.volume;
    });
    this.logger.trace('Building the issue form');
    this.scrapeSeriesForm = this.formBuilder.group({
      publisher: [this.originalPublisher],
      series: [this.originalSeries],
      volume: [this.originalVolume],
      metadataSource: ['', Validators.required],
      skipCache: ['']
    });
    this.logger.trace('Subscribing to user updates');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.scrapeSeriesForm.controls.skipCache.setValue(
        getUserPreference(
          user.preferences,
          SKIP_CACHE_PREFERENCE,
          `${false}`
        ) === `${true}`
      );
    });
    this.logger.trace('Subscribing to metadata source list');
    this.metadataSourceListSubscription = this.store
      .select(selectMetadataSourceList)
      .subscribe(list => {
        this.logger.trace('Setting metadata source list');
        this.metadataSourceList = list;
        this.metadataSource = this.metadataSourceList.find(
          source => source.preferred
        );
      });
    this.logger.trace('Subscribing to metadata source list state');
    this.metadataSourceListStateSubscription = this.store
      .select(selectMetadataSourceListState)
      .subscribe(state => {
        this.metadataSourceListState = state;
        this.updateBusyState();
      });
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to metadata volume list updates');
    this.scrapingVolumeSubscription = this.store
      .select(selectScrapingVolumeMetadata)
      .subscribe(volumes => (this.scrapingVolumes = volumes));
    this.logger.trace(
      'Subscribing to fetching issues for series state updates'
    );
    this.fetchIssuesForSeriesStateSubscription = this.store
      .select(selectSeriesScrapingState)
      .subscribe(state => {
        this.fetchIssuesForSeriesState = state;
        this.updateBusyState();
      });
    this.metadataStateSubscription = this.store
      .select(selectSingleBookScrapingState)
      .subscribe(state => {
        this.metadataState = state;
        this.updateBusyState();
      });
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

  get metadataSource(): MetadataSource {
    return this.metadataSourceList.find(
      source =>
        source.id === this.scrapeSeriesForm.controls.metadataSource.value
    );
  }

  set metadataSource(metadataSource: MetadataSource) {
    this.logger.debug(`Selected metadata source: ${metadataSource?.name}`);
    this.scrapeSeriesForm.controls.metadataSource.setValue(metadataSource?.id);
  }

  ngOnInit(): void {
    this.logger.trace('Fetching metadata source list');
    this.store.dispatch(loadMetadataSources());
    this.logger.trace('Clearing volumes');
    this.scrapingVolumes = [];
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from parameter updates');
    this.paramSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from metadata source list updates');
    this.metadataSourceListSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from metadata source list state updates');
    this.metadataSourceListStateSubscription.unsubscribe();
    this.logger.trace(
      'Unsubscribing from fetching issues for series state updates'
    );
    this.fetchIssuesForSeriesStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
  }

  onMetadataSourceSelected(id: number): void {
    this.logger.debug(`Selected metadata source: id=${id}`);
    this.metadataSource = this.metadataSourceList.find(
      source => source.id === id
    );
  }

  onFetchVolumeCandidates(): void {
    const series = this.scrapeSeriesForm.controls['series'].value;
    this.logger.debug(
      `Fetching candidates for series: series=${series} source=${this.metadataSource}`
    );
    this.store.dispatch(
      loadVolumeMetadata({
        metadataSource: this.metadataSource,
        series,
        maximumRecords: this.maximumRecords,
        skipCache: this.skipCache
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
    this.busy =
      this.metadataSourceListState?.busy ||
      this.metadataState?.busy ||
      this.metadataState?.loadingRecords ||
      this.fetchIssuesForSeriesState?.busy;
    this.store.dispatch(setBusyState({ enabled: this.busy }));
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
}
