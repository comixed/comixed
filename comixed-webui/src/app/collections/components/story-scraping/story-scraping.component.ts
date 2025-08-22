/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  AfterViewInit,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { loadMetadataSources } from '@app/comic-metadata/actions/metadata-source-list.actions';
import { selectMetadataSourceList } from '@app/comic-metadata/selectors/metadata-source-list.selectors';
import {
  loadStoryCandidates,
  resetStoryCandidates,
  scrapeStoryMetadata
} from '@app/comic-metadata/actions/scrape-story.actions';
import { METADATA_RECORD_LIMITS } from '@app/comic-metadata/comic-metadata.constants';
import { StoryMetadata } from '@app/collections/models/story-metadata';
import {
  selectScrapedStoryCandidates,
  selectScrapeStoryState
} from '@app/comic-metadata/selectors/scrape-story.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MatTableDataSource } from '@angular/material/table';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@tragically-slick/confirmation';

@Component({
  selector: 'cx-story-scraping',
  templateUrl: './story-scraping.component.html',
  styleUrl: './story-scraping.component.scss',
  standalone: false
})
export class StoryScrapingComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly maxRecordsOptions = METADATA_RECORD_LIMITS;
  readonly displayedColumns = ['action', 'thumbnail', 'name', 'publisher'];
  skipCache = false;
  metadataSource: MetadataSource | null = null;
  storyScrapingForm: FormGroup;
  metadataSourcesSubscription: Subscription;
  metadataSources: MetadataSource[] = [];
  scrapeStoryStateSubscription: Subscription;
  storyCandidateSubscription: Subscription;
  dataSource = new MatTableDataSource<StoryMetadata>([]);
  imageUrl: string | null = null;
  imageTitle: string | null = null;
  queryParameterService = inject(QueryParameterService);
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  logger = inject(LoggerService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);

  constructor() {
    this.logger.trace('Creating story scraping form');
    this.storyScrapingForm = this.formBuilder.group({
      metadataSource: [null, [Validators.required]],
      referenceId: [''],
      maxRecords: [0, [Validators.required]],
      storyName: ['', [Validators.required]]
    });
    this.logger.trace('Subscribing to metadata source list updates');
    this.metadataSourcesSubscription = this.store
      .select(selectMetadataSourceList)
      .subscribe(list => (this.metadataSources = list));
    this.logger.trace('Subscribing to story scraping state updates');
    this.scrapeStoryStateSubscription = this.store
      .select(selectScrapeStoryState)
      .subscribe(state =>
        this.store.dispatch(setBusyState({ enabled: state.busy }))
      );
    this.logger.trace('Subscribing to story candidates updates');
    this.storyCandidateSubscription = this.store
      .select(selectScrapedStoryCandidates)
      .subscribe(list => (this.dataSource.data = list));
  }

  @Input() set storyName(storyName: string) {
    this.storyScrapingForm.controls.storyName.setValue(storyName);
  }

  get readyToScrapeByReference(): boolean {
    return (
      this.storyScrapingForm.controls.referenceId.value.length > 0 &&
      this.storyScrapingForm.controls.metadataSource.value !== null
    );
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up pagination');
    this.dataSource.paginator = this.paginator;
    this.logger.trace('Setting up sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (element, property) => {
      switch (property) {
        case 'publisher':
          return element.publisher?.toUpperCase();
        case 'name':
        default:
          return element.name.toUpperCase();
      }
    };
  }

  ngOnInit(): void {
    this.logger.trace('Loading metadata sources');
    this.store.dispatch(loadMetadataSources());
    this.logger.trace('Resetting story scraping state');
    this.store.dispatch(resetStoryCandidates());
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from metadata source list updates');
    this.metadataSourcesSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from scrape story state updates');
    this.scrapeStoryStateSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from story candidate list updates');
    this.storyCandidateSubscription.unsubscribe();
  }

  onLoadStoryCandidates(): void {
    this.logger.debug('Loading story candidates:');
    const sourceId = this.storyScrapingForm.controls.metadataSource.value;
    const name = this.storyScrapingForm.controls.storyName.value;
    const maxRecords = this.storyScrapingForm.controls.maxRecords.value;
    const skipCache = this.skipCache;
    this.store.dispatch(
      loadStoryCandidates({ sourceId, name, maxRecords, skipCache })
    );
  }

  onScrapeByReferenceId(): void {
    this.doScrapeStory(this.storyScrapingForm.controls.referenceId.value);
  }

  onShowPopup(entry: StoryMetadata): void {
    this.imageUrl = entry?.imageUrl || null;
    this.imageTitle = entry?.name || null;
  }

  onScrapeStory(entry: StoryMetadata): void {
    this.doScrapeStory(entry.referenceId);
  }

  private doScrapeStory(referenceId: string): void {
    const storyName = this.storyScrapingForm.controls.storyName.value;
    const sourceId = this.storyScrapingForm.controls.metadataSource.value;
    /* istanbul ignore next */
    const sourceName = this.metadataSources.filter(
      entry => entry.metadataSourceId === sourceId
    )[0]?.name;

    this.confirmationService.confirm({
      title: this.translateService.instant(
        'scrape-story.scrape-story-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'scrape-story.scrape-story-metadata.confirmation-message',
        { story: storyName, source: sourceName }
      ),
      confirm: () => {
        this.logger.debug(
          'Scraping story with reference ID',
          referenceId,
          ' from source',
          this.metadataSource
        );
        this.store.dispatch(
          scrapeStoryMetadata({
            sourceId,
            referenceId,
            skipCache: this.skipCache
          })
        );
      }
    });
  }
}
