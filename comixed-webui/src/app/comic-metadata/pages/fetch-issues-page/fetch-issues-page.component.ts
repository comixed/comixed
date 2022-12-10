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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { loadVolumeMetadata } from '@app/comic-metadata/actions/metadata.actions';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import {
  selectMetadataState,
  selectVolumeMetadata
} from '@app/comic-metadata/selectors/metadata.selectors';
import { MetadataState } from '@app/comic-metadata/reducers/metadata.reducer';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { SKIP_CACHE_PREFERENCE } from '@app/library/library.constants';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { fetchIssuesForSeries } from '@app/comic-metadata/actions/fetch-issues-for-series.actions';

@Component({
  selector: 'cx-fetch-issues-page',
  templateUrl: './fetch-issues-page.component.html',
  styleUrls: ['./fetch-issues-page.component.scss']
})
export class FetchIssuesPageComponent implements OnInit, OnDestroy {
  fetchIssuesForm: FormGroup;
  publisher = '';
  series = '';
  volume = '';

  userSubscription: Subscription;
  paramSubscription: Subscription;
  metadataSourceListSubscription: Subscription;
  metadataSourceListStateSubscription: Subscription;
  metadataSourceListState: MetadataSourceListState;
  scrapingVolumeSubscription: Subscription;
  scrapingVolumes: VolumeMetadata[] = [];
  pageSize = 10;
  metadataStateSubscription: Subscription;
  metadataState: MetadataState;
  busy = false;
  metadataSourceList: MetadataSource[] = [];
  langChangeSubscription: Subscription;
  selectedVolume: VolumeMetadata;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private titleService: TitleService,
    private confirmationService: ConfirmationService
  ) {
    this.logger.trace('Loading page parameters');
    this.paramSubscription = this.activatedRoute.params.subscribe(params => {
      this.logger.debug('Route parameters:', params);
      this.publisher = params.publisher;
      this.series = params.series;
      this.volume = params.volume;
    });
    this.logger.trace('Building the issue form');
    this.fetchIssuesForm = this.formBuilder.group({
      publisher: [this.publisher],
      series: [this.series],
      volume: [this.volume],
      metadataSource: ['', Validators.required],
      skipCache: ['']
    });
    this.logger.trace('Subscribing to user updates');
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.fetchIssuesForm.controls.skipCache.setValue(
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
      .select(selectVolumeMetadata)
      .subscribe(volumes => (this.scrapingVolumes = volumes));
    this.metadataStateSubscription = this.store
      .select(selectMetadataState)
      .subscribe(state => {
        this.metadataState = state;
        this.updateBusyState();
      });
    this.loadTranslations();
  }

  get skipCache(): boolean {
    return this.fetchIssuesForm.controls.skipCache.value;
  }

  set skipCache(skipCache: boolean) {
    this.store.dispatch(
      saveUserPreference({ name: SKIP_CACHE_PREFERENCE, value: `${skipCache}` })
    );
  }

  get metadataSource(): MetadataSource {
    return this.metadataSourceList.find(
      source => source.id === this.fetchIssuesForm.controls.metadataSource.value
    );
  }

  set metadataSource(metadataSource: MetadataSource) {
    this.logger.debug(`Selected metadata source: ${metadataSource?.name}`);
    this.fetchIssuesForm.controls.metadataSource.setValue(metadataSource?.id);
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
    this.logger.trace('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
  }

  onMetadataSourceSelected(id: number): void {
    this.logger.debug(`Selected metadata source: id=${id}`);
    this.metadataSource = this.metadataSourceList.find(
      source => source.id === id
    );
  }

  onFetchIssues(): void {
    this.logger.debug(
      `Fetching issues for series: publisher=${this.publisher} series=${this.series} volume=${this.volume} source=${this.metadataSource}`
    );
    this.store.dispatch(
      loadVolumeMetadata({
        metadataSource: this.metadataSource,
        series: this.series,
        maximumRecords: 0,
        skipCache: this.skipCache
      })
    );
  }

  loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('metadata.fetch-issues.tab-title', {
        publisher: this.publisher,
        series: this.series,
        volume: this.volume
      })
    );
  }

  updateBusyState(): void {
    this.busy =
      this.metadataSourceListState?.busy ||
      this.metadataState?.busy ||
      this.metadataState?.loadingRecords;
    this.store.dispatch(setBusyState({ enabled: this.busy }));
  }

  onVolumeSelected(volume: VolumeMetadata): void {
    this.logger.debug('Volume selected:', volume);
    this.selectedVolume = volume;
  }

  onVolumeChosen(volume: VolumeMetadata): void {
    this.logger.debug('Volume chosen:', volume);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'metadata.fetch-issues.confirmation-title'
      ),
      message: this.translateService.instant(
        'metadata.fetch-issues.confirmation-message',
        {
          publisher: volume.publisher,
          series: volume.name,
          volume: volume.startYear
        }
      ),
      confirm: () => {
        this.logger.debug('Fetching issues for series');
        this.store.dispatch(
          fetchIssuesForSeries({
            source: this.metadataSource,
            volume
          })
        );
      }
    });
  }
}
