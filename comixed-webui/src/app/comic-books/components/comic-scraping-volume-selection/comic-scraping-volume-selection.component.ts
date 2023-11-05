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
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { MatTableDataSource } from '@angular/material/table';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IssueMetadata } from '@app/comic-metadata/models/issue-metadata';
import { Store } from '@ngrx/store';
import {
  loadIssueMetadata,
  resetMetadataState,
  scrapeSingleComicBook
} from '@app/comic-metadata/actions/single-book-scraping.actions';
import { Subscription } from 'rxjs';
import {
  selectScrapingIssueMetadata,
  selectSingleBookScrapingState
} from '@app/comic-metadata/selectors/single-book-scraping.selectors';
import { TranslateService } from '@ngx-translate/core';
import { SortableListItem } from '@app/core/models/ui/sortable-list-item';
import { setBusyState } from '@app/core/actions/busy.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { PAGE_SIZE_OPTIONS } from '@app/core';
import { multiBookScrapeComic } from '@app/comic-metadata/actions/multi-book-scraping.actions';

export const MATCHABILITY = 'matchability';
export const EXACT_MATCH = 2;
export const EXACT_MATCH_TEXT = 'scraping.text.exact-match';
export const NEAR_MATCH = 1;
export const NEAR_MATCH_TEXT = 'scraping.text.near-match';
export const NO_MATCH = 0;
export const NO_MATCH_TEXT = 'scraping.text.no-match';

@Component({
  selector: 'cx-scraping-volume-selection',
  templateUrl: './comic-scraping-volume-selection.html',
  styleUrls: ['./comic-scraping-volume-selection.scss']
})
export class ComicScrapingVolumeSelectionComponent
  implements OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  @Input() comicBook: ComicBook = null;
  @Input() metadataSource: MetadataSource;
  @Input() comicSeriesName: string;
  @Input() comicVolume: string;
  @Input() comicIssueNumber: string;
  @Input() skipCache = false;
  @Input() pageSize: number;
  @Input() multimode = false;

  @Output() volumeSelected = new EventEmitter<VolumeMetadata>();

  issueSubscription: Subscription;
  scrapingStateSubscription: Subscription;
  selectedVolume: VolumeMetadata;
  dataSource = new MatTableDataSource<SortableListItem<VolumeMetadata>>();
  displayedColumns = [
    MATCHABILITY,
    'publisher',
    'name',
    'start-year',
    'issue-count'
  ];
  confirmBeforeScraping = true;
  autoSelectExactMatch = false;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.issueSubscription = this.store
      .select(selectScrapingIssueMetadata)
      .subscribe(issue => (this.issue = issue));
    this.scrapingStateSubscription = this.store
      .select(selectSingleBookScrapingState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.loadingRecords }));
        this.autoSelectExactMatch = state.autoSelectExactMatch;
      });
  }

  private _issue: IssueMetadata;

  get issue(): IssueMetadata {
    return this._issue;
  }

  set issue(issue: IssueMetadata) {
    this._issue = issue;
    if (
      !!issue &&
      this.autoSelectExactMatch &&
      this.dataSource.data.filter(entry => entry.sortOrder === EXACT_MATCH)
        .length === 1
    ) {
      this.logger.debug('Auto-selecting exact match:', this.issue);
      this.scrapeComic();
    }
  }

  @Input() set volumes(volumes: VolumeMetadata[]) {
    this.logger.trace('Received scraping volumes');
    this.dataSource.data = volumes.map(volume => {
      const sortOrder =
        volume.name === this.comicSeriesName &&
        volume.startYear === this.comicVolume
          ? EXACT_MATCH
          : volume.name === this.comicSeriesName
          ? NEAR_MATCH
          : NO_MATCH;
      return {
        item: volume,
        sortOrder
      } as SortableListItem<VolumeMetadata>;
    });
    this.selectedVolume = null;
    const exactMatches = this.dataSource.data.filter(
      entry => entry.sortOrder === EXACT_MATCH
    );
    if (exactMatches.length > 0) {
      this.logger.debug('Preselecting volume:', exactMatches[0]);
      this.onVolumeSelected(exactMatches[0].item);
    }
  }

  ngOnDestroy(): void {
    this.issueSubscription.unsubscribe();
    this.scrapingStateSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting up pagination');
    this.dataSource.paginator = this.paginator;
    this.logger.trace('Setting up sorting');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (element, property) => {
      switch (property) {
        case MATCHABILITY:
          return element.sortOrder;
        case 'start-year':
          return element.item.startYear;
        case 'issue-count':
          return element.item.issueCount;
        default:
          return element.item[property];
      }
    };
    this.logger.trace('Setting up filtering');
    this.dataSource.filterPredicate = (data, filter) => {
      return (
        this.matchesFilter(data.item.name, filter) ||
        this.matchesFilter(data.item.publisher, filter) ||
        this.matchesFilter(data.item.startYear, filter)
      );
    };
  }

  onVolumeSelected(volume: VolumeMetadata): void {
    this.logger.trace('Volume selected:', volume);
    this.selectedVolume = volume;
    this.store.dispatch(
      loadIssueMetadata({
        metadataSource: this.metadataSource,
        volumeId: volume.id,
        issueNumber: this.comicIssueNumber,
        skipCache: this.skipCache
      })
    );
  }

  onDecision(decision: boolean, volume: VolumeMetadata): void {
    this.logger.trace(
      `Scraping issue was ${decision ? 'accepted' : 'rejected'}`
    );
    if (decision) {
      if (!this.confirmBeforeScraping) {
        this.scrapeComic();
      } else {
        this.confirmationService.confirm({
          title: this.translateService.instant(
            'scraping.scrape-comic-confirmation-title'
          ),
          message: this.translateService.instant(
            'scraping.scrape-comic-confirmation-message'
          ),
          confirm: () => this.scrapeComic()
        });
      }
    } else {
      this.issue = null;
    }
  }

  onCancelScraping(): void {
    this.logger.trace('Canceling scraping');
    this.store.dispatch(resetMetadataState());
  }

  scrapeComic(): void {
    this.logger.debug('User confirmed scraping the comic:', this.multimode);
    if (this.multimode) {
      this.logger.debug('Scraping multi-book comic');
      this.store.dispatch(
        multiBookScrapeComic({
          comicBook: this.comicBook,
          metadataSource: this.metadataSource,
          issueId: this.issue.id,
          skipCache: this.skipCache
        })
      );
    } else {
      this.logger.debug('Scraping single comic book');
      this.store.dispatch(
        scrapeSingleComicBook({
          metadataSource: this.metadataSource,
          issueId: this.issue.id,
          comic: this.comicBook,
          skipCache: this.skipCache
        })
      );
    }
  }

  matchesFilter(value: string, filter: string): boolean {
    return (
      (value || '').toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !==
      -1
    );
  }
}
