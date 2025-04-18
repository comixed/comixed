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
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { Store } from '@ngrx/store';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { MetadataEvent } from '@app/comic-metadata/models/event/metadata-event';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  MATCH_PUBLISHER_PREFERENCE,
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';
import { updateComicBook } from '@app/comic-books/actions/comic-book.actions';
import { Subscription } from 'rxjs';
import {
  resetScrapedMetadata,
  scrapeMetadataFromFilename
} from '@app/comic-files/actions/scrape-metadata.actions';
import { selectScrapeMetadataState } from '@app/comic-files/selectors/scrape-metadata.selectors';
import { filter } from 'rxjs/operators';
import {
  scrapeSingleComicBook,
  setAutoSelectExactMatch,
  setChosenMetadataSource,
  setConfirmBeforeScraping
} from '@app/comic-metadata/actions/single-book-scraping.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ListItem } from '@app/core/models/ui/list-item';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { selectMetadataSourceList } from '@app/comic-metadata/selectors/metadata-source-list.selectors';
import { loadMetadataSources } from '@app/comic-metadata/actions/metadata-source-list.actions';
import { selectSingleBookScrapingState } from '@app/comic-metadata/selectors/single-book-scraping.selectors';
import { METADATA_RECORD_LIMITS } from '@app/comic-metadata/comic-metadata.constants';

@Component({
  selector: 'cx-comic-scraping',
  templateUrl: './comic-scraping.component.html',
  styleUrls: ['./comic-scraping.component.scss']
})
export class ComicScrapingComponent implements OnInit, OnDestroy {
  @Input() skipCache = false;
  @Input() matchPublisher = false;
  @Input() maximumRecords = 0;
  @Input() multiMode = false;
  @Output() scrape = new EventEmitter<MetadataEvent>();

  readonly maximumRecordsOptions = METADATA_RECORD_LIMITS;

  comicForm: FormGroup;
  scrapedMetadataSubscription: Subscription;
  metadataSourceListSubscription: Subscription;
  metadataSourceList: ListItem<MetadataSource>[] = [];
  metadataSubscription: Subscription;
  confirmBeforeScraping = true;
  autoSelectExactMatch = false;
  _preferredMetadataSource: MetadataSource | null = null;
  _selectedMetadataSource: MetadataSource | null = null;

  constructor(
    private logger: LoggerService,
    private formBuilder: UntypedFormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.comicForm = this.formBuilder.group({
      publisher: [''],
      series: ['', [Validators.required]],
      volume: ['', [Validators.pattern('[0-9]{4}')]],
      issueNumber: ['', [Validators.required]],
      referenceId: [''],
      imprint: [''],
      sortName: [''],
      title: [''],
      description: ['']
    });
    this.store.dispatch(resetScrapedMetadata());
    this.scrapedMetadataSubscription = this.store
      .select(selectScrapeMetadataState)
      .pipe(filter(state => state.found))
      .subscribe(state => {
        this.logger.debug('Filename scraping data updated');
        this.comicForm.controls.series.setValue(state.series);
        this.comicForm.controls.volume.setValue(state.volume);
        this.comicForm.controls.issueNumber.setValue(state.issueNumber);
      });
    this.metadataSourceListSubscription = this.store
      .select(selectMetadataSourceList)
      .subscribe(sources => {
        if (sources.length === 1) {
          this._preferredMetadataSource = sources[0];
        } else {
          this._preferredMetadataSource = sources.find(
            entry => entry.preferred
          );
        }
        this.metadataSourceList = sources.map(source => {
          return { label: source.name, value: source };
        });
      });
    this.metadataSubscription = this.store
      .select(selectSingleBookScrapingState)
      .subscribe(state => {
        this.logger.debug('Metadata state changed');
        this.confirmBeforeScraping = state.confirmBeforeScraping;
        this.autoSelectExactMatch = state.autoSelectExactMatch;
        this._selectedMetadataSource = state.metadataSource;
      });
  }

  _previousMetadataSource: MetadataSource | null = null;

  @Input()
  set previousMetadataSource(source: MetadataSource | null) {
    this._previousMetadataSource = source;
  }

  get metadataSource(): MetadataSource | null {
    return (
      this._selectedMetadataSource ||
      this._previousMetadataSource ||
      this._preferredMetadataSource
    );
  }

  @Input() set metadataSource(source: MetadataSource | null) {
    this._preferredMetadataSource = source;
  }

  private _comic: ComicBook;

  get comic(): ComicBook {
    return this._comic;
  }

  @Input() set comic(comic: ComicBook) {
    this.logger.debug('Loading comic form:', comic);
    this._comic = comic;
    this.logger.debug('Loading form fields');
    this.comicForm.controls.referenceId.setValue(comic.metadata?.referenceId);
    this.comicForm.controls.publisher.setValue(comic.detail.publisher);
    this.comicForm.controls.series.setValue(comic.detail.series);
    this.comicForm.controls.volume.setValue(comic.detail.volume);
    this.comicForm.controls.issueNumber.setValue(comic.detail.issueNumber);
    this.comicForm.controls.imprint.setValue(comic.detail.imprint);
    this.comicForm.updateValueAndValidity();
  }

  get readyToScrape(): boolean {
    return !!this.metadataSource && this.comicForm.valid;
  }

  ngOnDestroy(): void {
    this.logger.debug('Unsubscribing from scraped metadata updates');
    this.scrapedMetadataSubscription.unsubscribe();
    this.logger.debug('Unsubscribing from metadata source list');
    this.metadataSourceListSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.logger.debug('Loading metadata sources');
    this.store.dispatch(loadMetadataSources());
  }

  @HostListener('window:keydown.shift.control.u', ['$event'])
  onHotkeyUndoChanges(event: KeyboardEvent): void {
    this.logger.debug('Undoing changes from hotkey');
    event.preventDefault();
    this.onUndoChanges();
  }

  onUndoChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('comic-book.undo-changes.title'),
      message: this.translateService.instant('comic-book.undo-changes.message'),
      confirm: () => {
        this.logger.debug('Undoing changes');
        this.comic = this._comic;
        this.comicForm.markAsUntouched();
      }
    });
  }

  @HostListener('window:keydown.shift.control.m', ['$event'])
  onHotKeyFetchScrapingVolumes(event: KeyboardEvent): void {
    this.logger.debug('Loading scraping volumes from hotkey');
    event.preventDefault();
    this.onFetchScrapingVolumes();
  }

  onFetchScrapingVolumes(): void {
    this.logger.debug('Loading scraping volumes');
    this.scrape.emit({
      metadataSource: this.metadataSource,
      publisher: this.comicForm.controls.publisher.value,
      series: this.comicForm.controls.series.value,
      volume: this.comicForm.controls.volume.value,
      issueNumber: this.comicForm.controls.issueNumber.value,
      maximumRecords: this.maximumRecords,
      skipCache: this.skipCache,
      matchPublisher: this.matchPublisher
    });
  }

  @HostListener('window:keydown.shift.control.c', ['$event'])
  onHotKeySkipCacheToggle(event: KeyboardEvent): void {
    this.logger.debug('Toggling skipping the cache from hotkey');
    event.preventDefault();
    this.onSkipCacheToggle();
  }

  onSkipCacheToggle(): void {
    this.logger.debug('Toggling skipping the cache');
    this.skipCache = this.skipCache === false;
    this.store.dispatch(
      saveUserPreference({
        name: SKIP_CACHE_PREFERENCE,
        value: `${this.skipCache}`
      })
    );
  }

  @HostListener('window:keydown.shift.control.p', ['$event'])
  onHotKeyMatchPublisherToggle(event: KeyboardEvent): void {
    this.logger.debug('Toggling matching publisher from hotkey');
    event.preventDefault();
    this.onMatchPublisherToggle();
  }

  onMatchPublisherToggle(): void {
    this.logger.debug('Toggling matching the publisher');
    this.matchPublisher = this.matchPublisher === false;
    this.store.dispatch(
      saveUserPreference({
        name: MATCH_PUBLISHER_PREFERENCE,
        value: `${this.matchPublisher}`
      })
    );
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

  @HostListener('window:keydown.shift.control.s', ['$event'])
  onHotKeySaveChanges(event: KeyboardEvent): void {
    this.logger.debug('Saving changes to comic from hotkey');
    event.preventDefault();
    this.onSaveChanges();
  }

  onSaveChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.save-changes.confirmation-title'
      ),
      message: this.translateService.instant(
        'comic-book.save-changes.confirmation-message'
      ),
      confirm: () => {
        const comic = this.encodeForm();
        this.logger.debug('Saving changes to comic:', comic);
        this.store.dispatch(updateComicBook({ comicBook: comic }));
      }
    });
  }

  @HostListener('window:keydown.shift.control.f', ['$event'])
  onHotKeyScrapeFilename(event: KeyboardEvent): void {
    this.logger.debug('Scraping filename from hotkey');
    event.preventDefault();
    this.onScrapeFilename();
  }

  onScrapeFilename(): void {
    const filename = this.comic.detail.baseFilename;
    this.logger.debug('Scraping the comic filename:', filename);
    this.store.dispatch(scrapeMetadataFromFilename({ filename }));
  }

  onMetadataSourceChosen(id: number): void {
    const metadataSource = this.metadataSourceList.find(
      entry => entry.value.metadataSourceId === id
    ).value;
    this.logger.debug('Metadata source selected:', metadataSource);
    this.store.dispatch(setChosenMetadataSource({ metadataSource }));
  }

  onScrapeWithReferenceId(): void {
    const referenceId = this.comicForm.controls.referenceId.value;
    this.logger.debug('Confirming scrape coming using reference id');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'scraping.scrape-comic-confirmation-title'
      ),
      message: this.translateService.instant(
        'scraping.scrape-comic-confirmation-message'
      ),
      confirm: () => {
        this.store.dispatch(
          scrapeSingleComicBook({
            comic: this.comic,
            metadataSource: this.metadataSource,
            issueId: referenceId,
            skipCache: this.skipCache
          })
        );
      }
    });
  }

  @HostListener('window:keydown.shift.control.o', ['$event'])
  onHotkeyToggleConfirmBeforeScrape(event: KeyboardEvent): void {
    this.logger.debug('Toggling confirm before scrape from hotkey');
    event.preventDefault();
    this.onToggleConfirmBeforeScrape();
  }

  onToggleConfirmBeforeScrape(): void {
    this.logger.debug('Firing event: toggling confirm before scrape');
    this.store.dispatch(
      setConfirmBeforeScraping({
        confirmBeforeScraping: !this.confirmBeforeScraping
      })
    );
  }

  @HostListener('window:keydown.shift.control.x', ['$event'])
  onHotKeyToggleAutoSelectExactMatch(event: KeyboardEvent): void {
    this.logger.debug('Toggling auto select exact match from hotkey');
    event.preventDefault();
    this.onToggleAutoSelectExactMatch();
  }

  onToggleAutoSelectExactMatch(): void {
    this.logger.debug('Firing event: toggle auto select exact match');
    this.store.dispatch(
      setAutoSelectExactMatch({
        autoSelectExactMatch: !this.autoSelectExactMatch
      })
    );
  }

  encodeForm(): ComicBook {
    this.logger.debug('Encoding comic');
    return {
      ...this.comic,
      detail: {
        ...this.comic.detail,
        comicDetailId: undefined,
        publisher: this.comicForm.controls.publisher.value,
        series: this.comicForm.controls.series.value,
        volume: this.comicForm.controls.volume.value,
        issueNumber: this.comicForm.controls.issueNumber.value
      }
    } as ComicBook;
  }
}
