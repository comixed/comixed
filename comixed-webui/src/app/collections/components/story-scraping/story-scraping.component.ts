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
  OnInit,
  ViewChild
} from '@angular/core';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
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
  selectScrapedStoryBusy,
  selectScrapedStoryCandidates
} from '@app/comic-metadata/selectors/scrape-story.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import {
  MatFormField,
  MatLabel,
  MatSuffix
} from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-story-scraping',
  templateUrl: './story-scraping.component.html',
  styleUrl: './story-scraping.component.scss',
  imports: [
    MatToolbar,
    MatIconButton,
    MatTooltip,
    MatIcon,
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatSuffix,
    MatPaginator,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatSortHeader,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    TranslateModule,
    AsyncPipe
  ]
})
export class StoryScrapingComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  readonly maxRecordsOptions = METADATA_RECORD_LIMITS;
  readonly displayedColumns = ['action', 'thumbnail', 'name', 'publisher'];
  storyScrapingForm: FormGroup;
  dataSource = new MatTableDataSource<StoryMetadata>([]);
  skipCache$ = new BehaviorSubject(false);
  metadataSource$ = new BehaviorSubject<MetadataSource | null>(null);
  metadataSources$ = new BehaviorSubject<MetadataSource[]>([]);
  imageUrl$ = new BehaviorSubject('');
  imageTitle$ = new BehaviorSubject('');
  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  constructor() {
    this.storyScrapingForm = this.formBuilder.group({
      metadataSource: [null, [Validators.required]],
      referenceId: [''],
      maxRecords: [0, [Validators.required]],
      storyName: ['', [Validators.required]]
    });
    this.store
      .select(selectMetadataSourceList)
      .pipe(tap(list => this.metadataSources$.next(list)))
      .subscribe();
    this.store
      .select(selectScrapedStoryBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectScrapedStoryCandidates)
      .pipe(tap(list => (this.dataSource.data = list)))
      .subscribe();
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

  onLoadStoryCandidates(): void {
    this.logger.debug('Loading story candidates:');
    const sourceId = this.storyScrapingForm.controls.metadataSource.value;
    const name = this.storyScrapingForm.controls.storyName.value;
    const maxRecords = this.storyScrapingForm.controls.maxRecords.value;
    const skipCache = this.skipCache$.value;
    this.store.dispatch(
      loadStoryCandidates({ sourceId, name, maxRecords, skipCache })
    );
  }

  onScrapeByReferenceId(): void {
    this.doScrapeStory(this.storyScrapingForm.controls.referenceId.value);
  }

  onShowPopup(entry: StoryMetadata): void {
    this.imageUrl$.next(entry?.imageUrl || '');
    this.imageTitle$.next(entry?.name || '');
  }

  onScrapeStory(entry: StoryMetadata): void {
    this.doScrapeStory(entry.referenceId);
  }

  onToggleSkipCache(): void {
    this.skipCache$.next(this.skipCache$.value === false);
  }

  private doScrapeStory(referenceId: string): void {
    const storyName = this.storyScrapingForm.controls.storyName.value;
    const sourceId = this.storyScrapingForm.controls.metadataSource.value;
    /* istanbul ignore next */
    const sourceName = this.metadataSources$.value.filter(
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
          this.metadataSource$.value
        );
        this.store.dispatch(
          scrapeStoryMetadata({
            sourceId,
            referenceId,
            skipCache: this.skipCache$.value
          })
        );
      }
    });
  }
}
